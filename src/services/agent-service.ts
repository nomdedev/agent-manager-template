import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { calculatorTool, dateTimeTool } from '../tools/index.js';
import type { Tool, ToolResult } from '../types/index.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  tools: Tool[];
}

const DEFAULT_AGENT: AgentConfig = {
  id: 'default',
  name: 'Assistant',
  systemPrompt: `You are a helpful AI assistant. You have access to tools for calculations and getting the current date/time.
Always respond in a clear and helpful manner. When using tools, explain what you're doing.`,
  model: 'gpt-4o-mini',
  tools: [calculatorTool, dateTimeTool],
};

export class AgentService {
  private openai: OpenAI | null = null;
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor() {
    if (config.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    }
  }

  async chat(message: string, agentId?: string): Promise<{
    response: string;
    toolsUsed: string[];
  }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in .env');
    }

    const agent = DEFAULT_AGENT;
    const conversationId = agentId ?? 'default';
    const history = this.conversations.get(conversationId) ?? [
      { role: 'system', content: agent.systemPrompt },
    ];

    history.push({ role: 'user', content: message });

    const toolsUsed: string[] = [];
    const openaiTools = agent.tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: this.zodToJsonSchema(tool.parameters),
      },
    }));

    const maxIterations = 10;
    let lastResponse = '';

    for (let i = 0; i < maxIterations; i++) {
      const response = await this.openai.chat.completions.create({
        model: agent.model,
        messages: history,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
      });

      const choice = response.choices[0];
      if (!choice?.message) break;

      history.push(choice.message);

      if (choice.finish_reason === 'stop') {
        lastResponse = choice.message.content ?? '';
        break;
      }

      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        for (const toolCall of choice.message.tool_calls) {
          const tool = agent.tools.find((t) => t.name === toolCall.function.name);
          if (!tool) continue;

          try {
            const params = JSON.parse(toolCall.function.arguments);
            const result: ToolResult = await tool.execute(params);
            toolsUsed.push(tool.name);
            history.push({
              role: 'tool',
              content: JSON.stringify(result),
              tool_call_id: toolCall.id,
            });
          } catch (err) {
            logger.error({ tool: toolCall.function.name, error: err }, 'Tool execution failed');
            history.push({
              role: 'tool',
              content: JSON.stringify({ success: false, error: 'Tool execution failed' }),
              tool_call_id: toolCall.id,
            });
          }
        }
        continue;
      }

      break;
    }

    this.conversations.set(conversationId, history);

    return { response: lastResponse, toolsUsed };
  }

  listAgents() {
    return [
      {
        id: DEFAULT_AGENT.id,
        name: DEFAULT_AGENT.name,
        model: DEFAULT_AGENT.model,
        toolsCount: DEFAULT_AGENT.tools.length,
      },
    ];
  }

  private zodToJsonSchema(schema: unknown): Record<string, unknown> {
    // Basic Zod to JSON Schema conversion
    if (schema && typeof schema === 'object' && '_def' in schema) {
      const def = (schema as { _def: { typeName: string; shape?: () => Record<string, unknown> } })._def;
      if (def.typeName === 'ZodObject' && def.shape) {
        const shape = def.shape();
        const properties: Record<string, unknown> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
          properties[key] = this.zodToJsonSchema(value);
          required.push(key);
        }

        return {
          type: 'object',
          properties,
          required,
        };
      }
    }
    return { type: 'string' };
  }
}

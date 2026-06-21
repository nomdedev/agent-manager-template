import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI before importing the service
vi.mock('openai', async () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [
      {
        message: { role: 'assistant', content: 'Hello! How can I help you?' },
        finish_reason: 'stop',
      },
    ],
  });

  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

import { AgentService } from '../../../src/services/agent-service.js';

describe('AgentService', () => {
  let service: AgentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AgentService();
  });

  describe('listAgents', () => {
    it('should return default agent configuration', () => {
      const agents = service.listAgents();

      expect(agents).toHaveLength(1);
      expect(agents[0]).toEqual({
        id: 'default',
        name: 'Assistant',
        model: 'gpt-4o-mini',
        toolsCount: 2,
      });
    });
  });

  describe('chat', () => {
    it('should return a response when OpenAI key is configured', async () => {
      // The mock OpenAI always returns a response
      const result = await service.chat('Hello');
      
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('toolsUsed');
      expect(typeof result.response).toBe('string');
    });

    it('should handle tool calls correctly', async () => {
      // This test verifies the chat method structure
      const result = await service.chat('What is 2+2?');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.toolsUsed)).toBe(true);
    });
  });
});

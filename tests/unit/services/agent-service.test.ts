import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OpenAI before importing the service
vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [
      {
        message: { role: 'assistant', content: 'Hello! How can I help you?' },
        finish_reason: 'stop',
      },
    ],
  });

  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
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
    it('should throw error when OpenAI key is not configured', async () => {
      // Create service without API key
      const serviceWithoutKey = new (await import('../../../src/services/agent-service.js')).AgentService();

      // The constructor will set openai to null if no key
      await expect(serviceWithoutKey.chat('Hello')).rejects.toThrow(
        'OpenAI API key not configured',
      );
    });
  });
});

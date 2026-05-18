import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AgentService } from '../services/agent-service.js';
import { logger } from '../utils/logger.js';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  agentId: z.string().optional(),
});

export async function agentRoutes(app: FastifyInstance) {
  const agentService = new AgentService();

  app.post<{
    Body: z.infer<typeof ChatRequestSchema>;
  }>(
    '/agents/chat',
    {
      schema: {
        body: ChatRequestSchema,
      },
    },
    async (request, reply) => {
      const { message, agentId } = request.body;

      logger.info({ agentId, messageLength: message.length }, 'Chat request received');

      const response = await agentService.chat(message, agentId);

      return reply.status(200).send({
        success: true,
        data: response,
      });
    },
  );

  app.get('/agents', async () => {
    const agents = agentService.listAgents();
    return { success: true, data: agents };
  });
}

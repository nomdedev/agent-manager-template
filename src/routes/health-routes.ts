import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { success: true, data: { status: 'ok', timestamp: new Date().toISOString() } };
  });
}

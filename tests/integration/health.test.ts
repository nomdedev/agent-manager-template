import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from '../../src/routes/health-routes.js';
import { errorHandler } from '../../src/middleware/error-handler.js';

describe('Health endpoint', () => {
  const app = Fastify();

  beforeAll(async () => {
    errorHandler(app);
    await app.register(cors, { origin: true });
    await app.register(healthRoutes, { prefix: '/api/v1' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
    expect(body.data.timestamp).toBeDefined();
  });
});

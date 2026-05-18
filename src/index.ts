import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { agentRoutes } from './routes/agent-routes.js';
import { healthRoutes } from './routes/health-routes.js';
import { errorHandler } from './middleware/error-handler.js';

async function main() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Plugins
  await app.register(cors, { origin: true });

  // Middleware
  errorHandler(app);

  // Routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(agentRoutes, { prefix: '/api/v1' });

  // Start
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Server running on http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

main();

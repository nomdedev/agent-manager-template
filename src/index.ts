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
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Plugins — CORS restringido por entorno
  const allowedOrigins = config.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://tu-dominio.vercel.app'])
    : true;
  await app.register(cors, { origin: allowedOrigins });

  // Middleware
  errorHandler(app);

  // Routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(agentRoutes, { prefix: '/api/v1' });

  // Start
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Server running on http://localhost:${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

main();

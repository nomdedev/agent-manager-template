import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger.js';

interface AppError {
  statusCode: number;
  code: string;
  message: string;
}

export function errorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = 'statusCode' in error ? error.statusCode ?? 500 : 500;
      const message =
        statusCode === 500 && process.env['NODE_ENV'] === 'production'
          ? 'Internal server error'
          : error.message;

      if (statusCode >= 500) {
        logger.error(error, 'Unhandled error');
      }

      reply.status(statusCode).send({
        success: false,
        error: {
          code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
          message,
        },
      });
    },
  );
}

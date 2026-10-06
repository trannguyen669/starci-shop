import pino from 'pino';

import { loadEnv } from './config/env';
import { requestContext } from './context/request-context';

const env = loadEnv();

export const loggerOptions = {
  level: env.LOG_LEVEL,

  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
        }
      : undefined,

  redact: ['req.headers.authorization', '*.password', '*.jwtSecret'],
};

export const logger = pino(loggerOptions);

export function getLogger() {
  return requestContext.getStore() ?? logger;
}

import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

import { requestContext } from '../context/request-context';
import { logger } from '../logger';

export interface RequestWithLogger extends Request {
  requestId: string;
  log: Logger;
}

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const id = req.header('x-request-id') || randomUUID();

  const requestLogger = logger.child({
    requestId: id,
  });

  const request = req as RequestWithLogger;

  request.requestId = id;
  request.log = requestLogger;

  res.setHeader('x-request-id', id);

  requestLogger.info(
    {
      method: req.method,
      url: req.originalUrl,
    },
    'request received',
  );

  requestContext.run(requestLogger, () => {
    next();
  });
}
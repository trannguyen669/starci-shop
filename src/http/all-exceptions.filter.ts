import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { Response } from 'express';

import type { ErrorEnvelope } from './error-envelope';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {// void: không trả về gì
    const response = host
      .switchToHttp()
      .getResponse<Response>();

    const isHttpException =
      exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let error =
      statusCode >= 500
        ? 'INTERNAL_ERROR'
        : 'REQUEST_ERROR';

    let message =
      statusCode >= 500
        ? 'Unexpected error'
        : 'Request failed';

    let details: unknown;

    if (isHttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (
        typeof payload === 'object' &&
        payload !== null
      ) {
        const body = payload as {
          message?: string | string[];
        };

        if (Array.isArray(body.message)) {
          error = 'VALIDATION_FAILED';
          message = 'Validation failed';
          details = body.message;
        } else if (
          typeof body.message === 'string'
        ) {
          message = body.message;
        }
      }
    }

    const envelope: ErrorEnvelope = {
      statusCode,
      error,
      message,
      ...(details !== undefined
        ? { details }
        : {}),
    };

    response
      .status(statusCode)
      .json(envelope);
  }
}
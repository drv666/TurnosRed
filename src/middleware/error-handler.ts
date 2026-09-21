import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details: unknown[] = [],
  ) {
    super(message);
  }
}

export const describeError = (error: unknown) => {
  if (error instanceof ZodError)
    return {
      status: 400,
      message: 'Error de validación en los datos ingresados',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
        code: issue.code,
      })),
    };
  if (error instanceof ApiError)
    return {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  )
    return {
      status: 400,
      message: 'El cuerpo no contiene JSON válido',
      code: 'INVALID_JSON',
      details: [],
    };
  return {
    status: 500,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    details: [],
  };
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) return next(error);
  const body = describeError(error);
  if (body.status === 500) console.error(error);
  return res.status(body.status).json(body);
};

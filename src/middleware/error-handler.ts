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

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: 'Error de validación en los datos ingresados',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
        code: issue.code,
      })),
    });
    return;
  }
  if (error instanceof ApiError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }
  if (
    error instanceof SyntaxError &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    res.status(400).json({
      status: 400,
      message: 'El cuerpo no contiene JSON válido',
      code: 'INVALID_JSON',
      details: [],
    });
    return;
  }
  console.error(error);
  res.status(500).json({
    status: 500,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    details: [],
  });
};

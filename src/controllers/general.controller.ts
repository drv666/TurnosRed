import type { Request, Response } from 'express';

export const bienvenida = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  let status = 500;
  try {
    status = 200;
    return res.status(status).json({
      status,
      message: 'Hello World - Bienvenido a TurnosRed API 3',
    });
  } catch {
    status = 500;
    return res.status(status).json({
      status,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      details: [],
    });
  }
};

export const rutaNoEncontrada = async (
  _req: Request,
  res: Response,
): Promise<Response> => {
  let status = 500;
  try {
    status = 404;
    throw new Error('Ruta no encontrada');
  } catch (error: unknown) {
    return res.status(status).json({
      status,
      message:
        error instanceof Error ? error.message : 'Error interno del servidor',
      code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
      details: [],
    });
  }
};

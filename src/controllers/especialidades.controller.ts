import type { Request, Response } from 'express';
import type { EspecialidadesService } from '../services/especialidades.service.js';
import { ApiError } from '../middleware/error-handler.js';

export class EspecialidadesController {
  constructor(private readonly service: EspecialidadesService) {}

  eliminar = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const raw = req.params.id;
      if (
        typeof raw !== 'string' ||
        !/^[1-9]\d*$/.test(raw) ||
        !Number.isSafeInteger(Number(raw))
      ) {
        status = 400;
        throw new Error('El ID debe ser un entero positivo');
      }
      await this.service.eliminar(Number(raw));
      status = 204;
      // HTTP 204 no lleva cuerpo de respuesta.
      return res.status(status).end();
    } catch (error: unknown) {
      if (error instanceof ApiError) status = error.status;
      const message =
        status !== 500 && error instanceof Error
          ? error.message
          : 'Error interno del servidor';
      return res.status(status).json({
        status,
        message,
        code:
          error instanceof ApiError
            ? error.code
            : status === 400
              ? 'VALIDATION_ERROR'
              : 'INTERNAL_ERROR',
        details: status === 400 ? [{ field: 'id', message }] : [],
      });
    }
  };

  actualizar = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    let field = 'id';
    try {
      const raw = req.params.id;
      if (
        typeof raw !== 'string' ||
        !/^[1-9]\d*$/.test(raw) ||
        !Number.isSafeInteger(Number(raw))
      ) {
        status = 400;
        throw new Error('El ID debe ser un entero positivo');
      }
      field = 'nombre';
      const body: unknown = req.body;
      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        !('nombre' in body) ||
        typeof body.nombre !== 'string' ||
        !body.nombre.trim()
      ) {
        status = 400;
        throw new Error('El nombre es obligatorio y debe ser texto');
      }
      const especialidad = await this.service.actualizar(
        Number(raw),
        body.nombre.trim(),
      );
      status = 200;
      return res.status(status).json(especialidad);
    } catch (error: unknown) {
      if (error instanceof ApiError) status = error.status;
      const message =
        status !== 500 && error instanceof Error
          ? error.message
          : 'Error interno del servidor';
      return res.status(status).json({
        status,
        message,
        code:
          error instanceof ApiError
            ? error.code
            : status === 400
              ? 'VALIDATION_ERROR'
              : 'INTERNAL_ERROR',
        details: status === 400 ? [{ field, message }] : [],
      });
    }
  };

  crear = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const body: unknown = req.body;
      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        !('nombre' in body) ||
        typeof body.nombre !== 'string' ||
        !body.nombre.trim()
      ) {
        status = 400;
        throw new Error('El nombre es obligatorio y debe ser texto');
      }
      const nueva = await this.service.crear(body.nombre.trim());
      status = 201;
      return res.status(status).json(nueva);
    } catch (error: unknown) {
      if (error instanceof ApiError) status = error.status;
      return res.status(status).json({
        status,
        message:
          status !== 500 && error instanceof Error
            ? error.message
            : 'Error interno del servidor',
        code:
          error instanceof ApiError
            ? error.code
            : status === 400
              ? 'VALIDATION_ERROR'
              : 'INTERNAL_ERROR',
        details:
          status === 400
            ? [
                {
                  field: 'nombre',
                  message:
                    error instanceof Error ? error.message : 'Nombre inválido',
                },
              ]
            : [],
      });
    }
  };

  obtener = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const raw = req.params.id;
      if (
        typeof raw !== 'string' ||
        !/^[1-9]\d*$/.test(raw) ||
        !Number.isSafeInteger(Number(raw))
      ) {
        status = 400;
        throw new Error('El ID debe ser un entero positivo');
      }
      const especialidad = await this.service.obtener(Number(raw));
      if (!especialidad) {
        status = 404;
        throw new Error('Especialidad no encontrada');
      }
      status = 200;
      return res.status(status).json(especialidad);
    } catch (error: unknown) {
      return res.status(status).json({
        status,
        message:
          status !== 500 && error instanceof Error
            ? error.message
            : 'Error interno del servidor',
        code:
          status === 400
            ? 'VALIDATION_ERROR'
            : status === 404
              ? 'NOT_FOUND'
              : 'INTERNAL_ERROR',
        details:
          status === 400
            ? [{ field: 'id', message: 'Debe ser un entero positivo' }]
            : [],
      });
    }
  };

  listar = async (_req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const especialidades = await this.service.listar();
      status = 200;
      return res.status(status).json(especialidades);
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
}

import type { Request, Response } from 'express';
import type { ProfesionalesService } from '../services/profesionales.service.js';
import { ApiError } from '../middleware/error-handler.js';

export class ProfesionalesController {
  constructor(private readonly service: ProfesionalesService) {}

  crear = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    let field = 'body';
    try {
      const body: unknown = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        status = 400;
        throw new Error('El cuerpo debe ser un objeto JSON');
      }
      field = 'nombre';
      if (
        !('nombre' in body) ||
        typeof body.nombre !== 'string' ||
        !body.nombre.trim()
      ) {
        status = 400;
        throw new Error('El nombre es obligatorio y debe ser texto');
      }
      field = 'matricula';
      if (
        !('matricula' in body) ||
        typeof body.matricula !== 'string' ||
        !body.matricula.trim()
      ) {
        status = 400;
        throw new Error('La matrícula es obligatoria y debe ser texto');
      }
      field = 'especialidadId';
      if (
        !('especialidadId' in body) ||
        typeof body.especialidadId !== 'number' ||
        !Number.isSafeInteger(body.especialidadId) ||
        body.especialidadId <= 0
      ) {
        status = 400;
        throw new Error('especialidadId debe ser un número entero positivo');
      }
      const nuevo = await this.service.crear({
        nombre: body.nombre.trim(),
        matricula: body.matricula.trim(),
        especialidadId: body.especialidadId,
      });
      status = 201;
      return res.status(status).json(nuevo);
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
        details:
          error instanceof ApiError
            ? error.details
            : status === 400
              ? [{ field, message }]
              : [],
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
      field = 'body';
      const body: unknown = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        status = 400;
        throw new Error('El cuerpo debe ser un objeto JSON');
      }
      field = 'nombre';
      if (
        !('nombre' in body) ||
        typeof body.nombre !== 'string' ||
        !body.nombre.trim()
      ) {
        status = 400;
        throw new Error('El nombre es obligatorio y debe ser texto');
      }
      field = 'matricula';
      if (
        !('matricula' in body) ||
        typeof body.matricula !== 'string' ||
        !body.matricula.trim()
      ) {
        status = 400;
        throw new Error('La matrícula es obligatoria y debe ser texto');
      }
      field = 'especialidadId';
      if (
        !('especialidadId' in body) ||
        typeof body.especialidadId !== 'number' ||
        !Number.isSafeInteger(body.especialidadId) ||
        body.especialidadId <= 0
      ) {
        status = 400;
        throw new Error('especialidadId debe ser un número entero positivo');
      }
      const nuevo = await this.service.actualizar(Number(raw), {
        nombre: body.nombre.trim(),
        matricula: body.matricula.trim(),
        especialidadId: body.especialidadId,
      });
      status = 200;
      return res.status(status).json(nuevo);
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
        details:
          error instanceof ApiError
            ? error.details
            : status === 400
              ? [{ field, message }]
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
      const profesional = await this.service.obtener(Number(raw));
      if (!profesional) {
        status = 404;
        throw new Error('Profesional no encontrado');
      }
      status = 200;
      return res.status(status).json(profesional);
    } catch (error: unknown) {
      const message =
        status !== 500 && error instanceof Error
          ? error.message
          : 'Error interno del servidor';
      return res.status(status).json({
        status,
        message,
        code:
          status === 400
            ? 'VALIDATION_ERROR'
            : status === 404
              ? 'NOT_FOUND'
              : 'INTERNAL_ERROR',
        details: status === 400 ? [{ field: 'id', message }] : [],
      });
    }
  };

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
      // HTTP 204 no permite un cuerpo de respuesta.
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
        details:
          error instanceof ApiError
            ? error.details
            : status === 400
              ? [{ field: 'id', message }]
              : [],
      });
    }
  };

  listar = async (_req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const profesionales = await this.service.listar();
      status = 200;
      return res.status(status).json(profesionales);
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

import type { NextFunction, Request, Response } from 'express';
import type { TurnoCrudo } from '../models/turno.js';
import type { TurnosService } from '../services/turnos.service.js';
import { ApiError } from '../middleware/error-handler.js';
import { appointmentQuerySchema } from '../schemas/query.schema.js';

const idValido = (valor: unknown): number | null => {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export class TurnosController {
  constructor(private readonly service: TurnosService) {}

  listar = (req: Request, res: Response): void => {
    res
      .status(200)
      .json(this.service.obtenerTodos(appointmentQuerySchema.parse(req.query)));
  };

  obtener = (req: Request, res: Response): void => {
    const id = idValido(req.params.id ?? '');
    if (id === null) {
      throw new ApiError(400, 'ID inválido', 'VALIDATION_ERROR', [
        { field: 'id', message: 'Debe ser un entero positivo' },
      ]);
    }
    const turno = this.service.obtenerPorId(id);
    if (!turno) {
      throw new ApiError(404, 'Turno no encontrado', 'NOT_FOUND');
    }
    res.status(200).json(turno);
  };

  crear = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const turno = await this.service.crear(req.body as TurnoCrudo);
      if (!turno) {
        throw new ApiError(
          400,
          'Datos inválidos o ID duplicado',
          'VALIDATION_ERROR',
        );
      }
      res.status(201).json(turno);
    } catch (error) {
      next(error);
    }
  };

  actualizar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = idValido(req.params.id ?? '');
      if (id === null) {
        throw new ApiError(400, 'ID inválido', 'VALIDATION_ERROR', [
          { field: 'id', message: 'Debe ser un entero positivo' },
        ]);
      }
      if (req.body.id !== undefined && req.body.id !== id) {
        throw new ApiError(
          400,
          'El id del cuerpo debe coincidir con la URL',
          'VALIDATION_ERROR',
          [{ field: 'id', message: 'No coincide con el id de la URL' }],
        );
      }
      const turno = await this.service.actualizar(id, req.body as TurnoCrudo);
      if (turno === undefined) {
        throw new ApiError(404, 'Turno no encontrado', 'NOT_FOUND');
      }
      if (turno === null) {
        throw new ApiError(400, 'Datos inválidos', 'VALIDATION_ERROR');
      }
      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  };

  eliminar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = idValido(req.params.id ?? '');
      if (id === null) {
        throw new ApiError(400, 'ID inválido', 'VALIDATION_ERROR', [
          { field: 'id', message: 'Debe ser un entero positivo' },
        ]);
      }
      const turno = await this.service.eliminar(id);
      if (!turno) {
        throw new ApiError(404, 'Turno no encontrado', 'NOT_FOUND');
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

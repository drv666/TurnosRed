import type { NextFunction, Request, Response } from 'express';
import type { TurnoCrudo } from '../models/turno.js';
import type { TurnosService } from '../services/turnos.service.js';

const idValido = (valor: unknown): number | null => {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export class TurnosController {
  constructor(private readonly service: TurnosService) {}

  listar = (_req: Request, res: Response): void => {
    res.status(200).json(this.service.obtenerTodos());
  };

  obtener = (req: Request, res: Response): void => {
    const id = idValido(req.params.id ?? '');
    if (id === null) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }
    const turno = this.service.obtenerPorId(id);
    if (!turno) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
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
        res.status(400).json({ error: 'Datos inválidos o ID duplicado' });
        return;
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
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      const turno = await this.service.actualizar(id, req.body as TurnoCrudo);
      if (turno === undefined) {
        res.status(404).json({ error: 'Turno no encontrado' });
        return;
      }
      if (turno === null) {
        res.status(400).json({ error: 'Datos inválidos' });
        return;
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
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      const turno = await this.service.eliminar(id);
      if (!turno) {
        res.status(404).json({ error: 'Turno no encontrado' });
        return;
      }
      res.status(200).json(turno);
    } catch (error) {
      next(error);
    }
  };
}

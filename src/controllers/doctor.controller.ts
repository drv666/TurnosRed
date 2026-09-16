import type { Request, Response } from 'express';
import { ApiError } from '../middleware/error-handler.js';
import type { DoctorService } from '../services/doctor.service.js';
import { doctorQuerySchema } from '../schemas/query.schema.js';

const readId = (req: Request): number => {
  const raw = req.params.id;
  const id = Number(raw);
  if (
    typeof raw !== 'string' ||
    !/^[1-9]\d*$/.test(raw) ||
    !Number.isSafeInteger(id)
  )
    throw new ApiError(400, 'ID inválido', 'VALIDATION_ERROR', [
      { field: 'id', message: 'Debe ser un entero positivo' },
    ]);
  return id;
};

export class DoctorController {
  constructor(private readonly service: DoctorService) {}
  list = (req: Request, res: Response): void => {
    res.status(200).json(this.service.list(doctorQuerySchema.parse(req.query)));
  };
  get = (req: Request, res: Response): void => {
    res.status(200).json(this.service.get(readId(req)));
  };
  create = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.service.create(req.body));
  };
  update = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.service.update(readId(req), req.body));
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(readId(req));
    res.status(204).end();
  };
}

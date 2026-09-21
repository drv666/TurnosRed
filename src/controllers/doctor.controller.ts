import type { Request, Response } from 'express';
import { ApiError, describeError } from '../middleware/error-handler.js';
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

  list = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const datos = this.service.list(doctorQuerySchema.parse(req.query));
      status = 200;
      return res.status(status).json(datos);
    } catch (error: unknown) {
      const body = describeError(error);
      status = body.status;
      return res.status(status).json(body);
    }
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const datos = this.service.get(readId(req));
      status = 200;
      return res.status(status).json(datos);
    } catch (error: unknown) {
      const body = describeError(error);
      status = body.status;
      return res.status(status).json(body);
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const datos = await this.service.create(req.body);
      status = 201;
      return res.status(status).json(datos);
    } catch (error: unknown) {
      const body = describeError(error);
      status = body.status;
      return res.status(status).json(body);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      const datos = await this.service.update(readId(req), req.body);
      status = 200;
      return res.status(status).json(datos);
    } catch (error: unknown) {
      const body = describeError(error);
      status = body.status;
      return res.status(status).json(body);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    let status = 500;
    try {
      await this.service.delete(readId(req));
      status = 204;
      return res.status(status).end();
    } catch (error: unknown) {
      const body = describeError(error);
      status = body.status;
      return res.status(status).json(body);
    }
  };
}

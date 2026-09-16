import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller.js';
import type { DoctorService } from '../services/doctor.service.js';
import { validateBody } from '../middleware/validate.js';
import { doctorSchema, updateDoctorSchema } from '../schemas/doctor.schema.js';

export const createDoctorRouter = (service: DoctorService): Router => {
  const router = Router();
  const controller = new DoctorController(service);
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', validateBody(doctorSchema), controller.create);
  router.put('/:id', validateBody(updateDoctorSchema), controller.update);
  router.delete('/:id', controller.delete);
  return router;
};

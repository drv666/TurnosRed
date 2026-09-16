import { Router } from 'express';
import type { TurnosController } from '../controllers/turnos.controller.js';
import { validateBody } from '../middleware/validate.js';
import {
  appointmentSchema,
  updateAppointmentSchema,
} from '../schemas/appointment.schema.js';

export const crearTurnosRouter = (controller: TurnosController): Router => {
  const router = Router();
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', validateBody(appointmentSchema), controller.crear);
  router.put(
    '/:id',
    validateBody(updateAppointmentSchema),
    controller.actualizar,
  );
  router.delete('/:id', controller.eliminar);
  return router;
};

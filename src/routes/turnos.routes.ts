import { Router } from 'express';
import type { TurnosController } from '../controllers/turnos.controller.js';

export const crearTurnosRouter = (controller: TurnosController): Router => {
  const router = Router();
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
};

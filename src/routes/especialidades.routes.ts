import { Router } from 'express';
import { EspecialidadesController } from '../controllers/especialidades.controller.js';
import { EspecialidadesService } from '../services/especialidades.service.js';

export const crearEspecialidadesRouter = (
  service: EspecialidadesService,
): Router => {
  const router = Router();
  const controller = new EspecialidadesController(service);
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
};

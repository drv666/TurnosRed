import { Router } from 'express';
import { ProfesionalesController } from '../controllers/profesionales.controller.js';
import { ProfesionalesService } from '../services/profesionales.service.js';

export const crearProfesionalesRouter = (
  service: ProfesionalesService,
): Router => {
  const router = Router();
  const controller = new ProfesionalesController(service);
  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
};

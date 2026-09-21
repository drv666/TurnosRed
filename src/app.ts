import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { TurnosController } from './controllers/turnos.controller.js';
import { crearTurnosRouter } from './routes/turnos.routes.js';
import type { TurnosService } from './services/turnos.service.js';
import { errorHandler } from './middleware/error-handler.js';
import {
  bienvenida,
  rutaNoEncontrada,
} from './controllers/general.controller.js';
import type { DoctorService } from './services/doctor.service.js';
import { createDoctorRouter } from './routes/doctor.routes.js';
import { crearEspecialidadesRouter } from './routes/especialidades.routes.js';
import { crearProfesionalesRouter } from './routes/profesionales.routes.js';
import { EspecialidadesService } from './services/especialidades.service.js';
import { ProfesionalesService } from './services/profesionales.service.js';

export const crearApp = (
  service: TurnosService,
  doctors?: DoctorService,
): express.Express => {
  const app = express();
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    next();
  });
  app.use(express.json());
  app.get('/', bienvenida);
  const especialidades = new EspecialidadesService();
  const profesionales = new ProfesionalesService(especialidades);
  app.use('/especialidades', crearEspecialidadesRouter(especialidades));
  app.use('/profesionales', crearProfesionalesRouter(profesionales));
  app.use('/turnos', crearTurnosRouter(new TurnosController(service)));
  if (doctors) app.use('/medicos', createDoctorRouter(doctors));
  app.use(rutaNoEncontrada);
  app.use(errorHandler);
  return app;
};

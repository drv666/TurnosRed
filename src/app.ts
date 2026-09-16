import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { TurnosController } from './controllers/turnos.controller.js';
import { crearTurnosRouter } from './routes/turnos.routes.js';
import type { TurnosService } from './services/turnos.service.js';
import { ApiError, errorHandler } from './middleware/error-handler.js';
import type { DoctorService } from './services/doctor.service.js';
import { createDoctorRouter } from './routes/doctor.routes.js';

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
  app.use('/turnos', crearTurnosRouter(new TurnosController(service)));
  if (doctors) app.use('/medicos', createDoctorRouter(doctors));
  app.use((_req: Request, _res: Response, next: NextFunction) =>
    next(new ApiError(404, 'Ruta no encontrada', 'NOT_FOUND')),
  );
  app.use(errorHandler);
  return app;
};

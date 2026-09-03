import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { TurnosController } from './controllers/turnos.controller.js';
import { crearTurnosRouter } from './routes/turnos.routes.js';
import type { TurnosService } from './services/turnos.service.js';

export const crearApp = (service: TurnosService): express.Express => {
  const app = express();
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    next();
  });
  app.use(express.json());
  app.use('/turnos', crearTurnosRouter(new TurnosController(service)));
  app.use((_req: Request, res: Response) =>
    res.status(404).json({ error: 'Ruta no encontrada' }),
  );
  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      void _next;
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    },
  );
  return app;
};

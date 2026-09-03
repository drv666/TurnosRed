import 'dotenv/config';
import { createServer } from 'node:http';
import path from 'node:path';
import { Server } from 'socket.io';
import { crearApp } from './app.js';
import { turnosEvents } from './events/turnos.events.js';
import type { Turno } from './models/turno.js';
import { TurnosService } from './services/turnos.service.js';

const puerto = Number(process.env.PORT ?? 3000);
const archivo = path.resolve(
  process.cwd(),
  process.env.DATA_FILE ?? './data/turnos.json',
);
const service = new TurnosService(archivo);

try {
  await service.cargar();
  const servidorHttp = createServer(crearApp(service));
  const io = new Server(servidorHttp, { cors: { origin: '*' } });
  turnosEvents.on('turno:creado', (turno: Turno) =>
    io.emit('turno:nuevo', turno),
  );
  turnosEvents.on('turno:actualizado', (turno: Turno) =>
    io.emit('turno:actualizado', turno),
  );
  turnosEvents.on('turno:eliminado', (turno: Turno) =>
    io.emit('turno:eliminado', turno),
  );
  io.on('connection', (socket) =>
    console.log(`Cliente Socket.IO conectado: ${socket.id}`),
  );
  servidorHttp.listen(puerto, () =>
    console.log(`TurnosRed disponible en http://localhost:${puerto}`),
  );
} catch {
  process.exitCode = 1;
}

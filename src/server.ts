import 'dotenv/config';
import { createServer } from 'node:http';
import path from 'node:path';
import { Server } from 'socket.io';
import { crearApp } from './app.js';
import { turnosEvents } from './events/turnos.events.js';
import type { Turno } from './models/turno.js';
import { TurnosService } from './services/turnos.service.js';
import { DoctorService } from './services/doctor.service.js';

const puerto = Number(process.env.PORT ?? 3000);
const archivo = path.resolve(
  process.cwd(),
  process.env.DATA_FILE ?? './data/turnos.json',
);
const doctors: DoctorService = new DoctorService(
  path.resolve(
    process.cwd(),
    process.env.DOCTORS_FILE ?? './data/medicos.json',
  ),
  (id) => service.obtenerTodos().some((turno) => turno.medicoId === id),
);
const service: TurnosService = new TurnosService(archivo, doctors);

try {
  await doctors.load();
  await service.cargar();
  const servidorHttp = createServer(crearApp(service, doctors));
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

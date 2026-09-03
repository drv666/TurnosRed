import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { turnosEvents } from '../events/turnos.events.js';
import type { Turno, TurnoCrudo } from '../models/turno.js';
import { normalizarTurno } from './normalizacion.service.js';

export class TurnosService {
  private turnos: Turno[] = [];
  constructor(private readonly archivo: string) {}

  async cargar(): Promise<void> {
    try {
      const contenido = await readFile(this.archivo, 'utf8');
      const crudos: unknown = JSON.parse(contenido);
      if (!Array.isArray(crudos))
        throw new Error('El JSON debe contener un arreglo');
      const normalizados = crudos.map((item) =>
        normalizarTurno(item as TurnoCrudo),
      );
      this.turnos = normalizados.filter(
        (turno): turno is Turno => turno !== null,
      );
      console.log(
        `Carga inicial: ${this.turnos.length} aceptados, ${crudos.length - this.turnos.length} rechazados.`,
      );
    } catch (error) {
      console.error('No se pudo leer el archivo de turnos:', error);
      throw error;
    }
  }

  obtenerTodos(): Turno[] {
    return this.turnos;
  }
  obtenerPorId(id: number): Turno | undefined {
    return this.turnos.find((turno) => turno.id === id);
  }

  async crear(crudo: TurnoCrudo): Promise<Turno | null> {
    const turno = normalizarTurno(crudo);
    if (!turno || this.obtenerPorId(turno.id)) return null;
    this.turnos.push(turno);
    await this.persistir();
    turnosEvents.emit('turno:creado', turno);
    return turno;
  }

  async actualizar(
    id: number,
    crudo: TurnoCrudo,
  ): Promise<Turno | null | undefined> {
    const indice = this.turnos.findIndex((turno) => turno.id === id);
    if (indice < 0) return undefined;
    const turno = normalizarTurno({ ...crudo, id });
    if (!turno) return null;
    this.turnos[indice] = turno;
    await this.persistir();
    turnosEvents.emit('turno:actualizado', turno);
    return turno;
  }

  async eliminar(id: number): Promise<Turno | undefined> {
    const indice = this.turnos.findIndex((turno) => turno.id === id);
    if (indice < 0) return undefined;
    const [eliminado] = this.turnos.splice(indice, 1);
    await this.persistir();
    turnosEvents.emit('turno:eliminado', eliminado);
    return eliminado;
  }

  private async persistir(): Promise<void> {
    await mkdir(path.dirname(this.archivo), { recursive: true });
    await writeFile(
      this.archivo,
      `${JSON.stringify(this.turnos, null, 2)}\n`,
      'utf8',
    );
  }
}

/* Comparación con callbacks:
import { readFile } from 'node:fs';
readFile('data/turnos.json', 'utf8', (error, contenido) => {
  if (error) return console.error(error);
  console.log(JSON.parse(contenido));
});
fs/promises permite mantener el flujo y la captura de errores con async/await y try/catch. */

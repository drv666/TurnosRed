import datos from '../data/especialidades.json' with { type: 'json' };
import type { Especialidad } from '../models/especialidad.js';
import { ApiError } from '../middleware/error-handler.js';

export class EspecialidadesService {
  private readonly especialidades: Especialidad[] = structuredClone(datos);

  async crear(nombre: string): Promise<Especialidad> {
    if (
      this.especialidades.some(
        (item) =>
          item.nombre.toLocaleLowerCase('es') ===
          nombre.toLocaleLowerCase('es'),
      )
    ) {
      throw new ApiError(
        400,
        'Ya existe una especialidad con ese nombre',
        'DUPLICATE_SPECIALTY',
      );
    }
    const id = Math.max(0, ...this.especialidades.map((item) => item.id)) + 1;
    const nueva = { id, nombre };
    this.especialidades.push(nueva);
    return { ...nueva };
  }

  async listar(): Promise<Especialidad[]> {
    return this.especialidades.map((especialidad) => ({ ...especialidad }));
  }

  async actualizar(id: number, nombre: string): Promise<Especialidad> {
    const especialidad = this.especialidades.find((item) => item.id === id);
    if (!especialidad) {
      throw new ApiError(404, 'Especialidad no encontrada', 'NOT_FOUND');
    }
    if (
      this.especialidades.some(
        (item) =>
          item.id !== id &&
          item.nombre.toLocaleLowerCase('es') ===
            nombre.toLocaleLowerCase('es'),
      )
    ) {
      throw new ApiError(
        400,
        'Ya existe una especialidad con ese nombre',
        'DUPLICATE_SPECIALTY',
      );
    }
    especialidad.nombre = nombre;
    return { ...especialidad };
  }

  async obtener(id: number): Promise<Especialidad | undefined> {
    const especialidad = this.especialidades.find((item) => item.id === id);
    return especialidad ? { ...especialidad } : undefined;
  }

  async eliminar(id: number): Promise<void> {
    const index = this.especialidades.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new ApiError(404, 'Especialidad no encontrada', 'NOT_FOUND');
    }
    this.especialidades.splice(index, 1);
  }
}

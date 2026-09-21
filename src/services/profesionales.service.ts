import datos from '../data/profesionales.json' with { type: 'json' };
import type { Profesional } from '../models/profesional.js';
import type { EspecialidadesService } from './especialidades.service.js';
import { ApiError } from '../middleware/error-handler.js';

export class ProfesionalesService {
  private readonly profesionales: Profesional[] = structuredClone(datos);

  constructor(private readonly especialidades: EspecialidadesService) {}

  async crear(datos: Omit<Profesional, 'id'>): Promise<Profesional> {
    if (!(await this.especialidades.obtener(datos.especialidadId))) {
      throw new ApiError(
        400,
        'La especialidad indicada no existe',
        'INVALID_SPECIALTY',
        [
          {
            field: 'especialidadId',
            message: 'Seleccione una especialidad existente',
          },
        ],
      );
    }
    if (
      this.profesionales.some(
        (item) =>
          item.matricula.toUpperCase() === datos.matricula.toUpperCase(),
      )
    ) {
      throw new ApiError(
        400,
        'La matrícula ya está registrada',
        'DUPLICATE_REGISTRATION',
        [{ field: 'matricula', message: 'Debe ser única' }],
      );
    }
    const id = Math.max(0, ...this.profesionales.map((item) => item.id)) + 1;
    const nuevo = { id, ...datos };
    this.profesionales.push(nuevo);
    return { ...nuevo };
  }

  async actualizar(
    id: number,
    datos: Omit<Profesional, 'id'>,
  ): Promise<Profesional> {
    const existente = this.profesionales.find((item) => item.id === id);
    if (!existente)
      throw new ApiError(404, 'Profesional no encontrado', 'NOT_FOUND');
    if (!(await this.especialidades.obtener(datos.especialidadId))) {
      throw new ApiError(
        400,
        'La especialidad indicada no existe',
        'INVALID_SPECIALTY',
        [
          {
            field: 'especialidadId',
            message: 'Seleccione una especialidad existente',
          },
        ],
      );
    }
    if (
      this.profesionales.some(
        (item) =>
          item.id !== id &&
          item.matricula.toUpperCase() === datos.matricula.toUpperCase(),
      )
    ) {
      throw new ApiError(
        400,
        'La matrícula ya está registrada',
        'DUPLICATE_REGISTRATION',
        [{ field: 'matricula', message: 'Debe ser única' }],
      );
    }
    Object.assign(existente, datos);
    return { ...existente };
  }

  async eliminar(id: number): Promise<void> {
    const index = this.profesionales.findIndex((item) => item.id === id);
    if (index === -1)
      throw new ApiError(404, 'Profesional no encontrado', 'NOT_FOUND');
    this.profesionales.splice(index, 1);
  }

  async listar(): Promise<Profesional[]> {
    return this.profesionales.map((profesional) => ({ ...profesional }));
  }

  async obtener(id: number): Promise<Profesional | undefined> {
    const profesional = this.profesionales.find((item) => item.id === id);
    return profesional ? { ...profesional } : undefined;
  }
}

import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { Doctor } from '../models/doctor.js';
import { doctorSchema } from '../schemas/doctor.schema.js';
import { ApiError } from '../middleware/error-handler.js';
import type { DoctorQuery } from '../schemas/query.schema.js';

export class DoctorService {
  private doctors: Doctor[] = [];
  private pending: Promise<unknown> = Promise.resolve();
  constructor(
    private readonly file: string,
    private readonly hasAppointments: (id: number) => boolean = () => false,
  ) {}

  async load(): Promise<void> {
    try {
      this.doctors = doctorSchema
        .array()
        .parse(JSON.parse(await readFile(this.file, 'utf8')));
      if (new Set(this.doctors.map((d) => d.id)).size !== this.doctors.length)
        throw new Error('IDs de médicos duplicados en el archivo');
    } catch (error) {
      if (!(
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ))
        throw error;
      await this.save([]);
    }
  }
  list(filters: DoctorQuery = {}): Doctor[] {
    return this.doctors
      .filter(
        (d) =>
          (filters.especialidad === undefined ||
            d.especialidad === filters.especialidad) &&
          (filters.disponible === undefined ||
            d.disponible === filters.disponible),
      )
      .map((d) => ({ ...d }));
  }
  get(id: number): Doctor {
    const doctor = this.doctors.find((d) => d.id === id);
    if (!doctor) throw new ApiError(404, 'Médico no encontrado', 'NOT_FOUND');
    return { ...doctor };
  }
  private queue<T>(action: () => Promise<T>): Promise<T> {
    const result = this.pending.then(action);
    this.pending = result.catch(() => undefined);
    return result;
  }
  create(doctor: Doctor): Promise<Doctor> {
    return this.queue(async () => {
      if (this.doctors.some((d) => d.id === doctor.id))
        throw new ApiError(
          400,
          'El id del médico ya existe',
          'VALIDATION_ERROR',
          [{ field: 'id', message: 'ID duplicado' }],
        );
      await this.save([...this.doctors, doctor]);
      return { ...doctor };
    });
  }
  update(
    id: number,
    input: Omit<Doctor, 'id'> & { id?: number },
  ): Promise<Doctor> {
    return this.queue(async () => {
      const previous = this.get(id);
      if (input.id !== undefined && input.id !== id)
        throw new ApiError(
          400,
          'El id del cuerpo debe coincidir con la URL',
          'VALIDATION_ERROR',
        );
      if (
        input.especialidad !== previous.especialidad &&
        this.hasAppointments(id)
      )
        throw new ApiError(
          400,
          'No se puede cambiar la especialidad de un médico con turnos asociados',
          'DOCTOR_HAS_APPOINTMENTS',
        );
      const doctor = { ...input, id };
      await this.save(this.doctors.map((d) => (d.id === id ? doctor : d)));
      return { ...doctor };
    });
  }
  delete(id: number): Promise<void> {
    return this.queue(async () => {
      this.get(id);
      if (this.hasAppointments(id))
        throw new ApiError(
          400,
          'El médico tiene turnos asociados; elimine o reasigne esos turnos primero',
          'DOCTOR_HAS_APPOINTMENTS',
        );
      await this.save(this.doctors.filter((d) => d.id !== id));
    });
  }
  private async save(doctors: Doctor[]): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    const temporary = `${this.file}.tmp`;
    await writeFile(temporary, JSON.stringify(doctors, null, 2) + '\n', 'utf8');
    await rename(temporary, this.file);
    this.doctors = doctors;
  }
}

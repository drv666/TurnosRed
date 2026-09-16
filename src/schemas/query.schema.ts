import { z } from 'zod';
import { specialtySchema } from './appointment.schema.js';

export const doctorQuerySchema = z.strictObject({
  especialidad: specialtySchema.optional(),
  disponible: z
    .enum(['true', 'false'], { error: 'Disponible debe ser true o false' })
    .transform((value) => value === 'true')
    .optional(),
});

export const appointmentQuerySchema = z.strictObject({
  especialidad: specialtySchema.optional(),
  fecha: z.iso
    .date({ error: 'La fecha debe tener formato AAAA-MM-DD y ser válida' })
    .optional(),
  medicoId: z
    .string()
    .regex(/^[1-9]\d*$/, 'MedicoId debe ser un entero positivo')
    .transform(Number)
    .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER))
    .optional(),
});

export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;

import { z } from 'zod';
import { specialtySchema } from './appointment.schema.js';

export const doctorSchema = z.strictObject({
  id: z.number().int().positive(),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  documento: z
    .string({ error: 'El documento debe ser texto, entre comillas' })
    .trim()
    .min(1),
  especialidad: specialtySchema,
  disponible: z.boolean({ error: 'Disponible debe ser true o false' }),
});

export const updateDoctorSchema = doctorSchema.extend({
  id: doctorSchema.shape.id.optional(),
});

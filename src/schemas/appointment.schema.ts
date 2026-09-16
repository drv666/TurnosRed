import { z } from 'zod';

export const specialtySchema = z.enum(
  ['Clínica médica', 'Pediatría', 'Odontología', 'Nutrición'],
  { error: 'Seleccione Clínica médica, Pediatría, Odontología o Nutrición' },
);

// El cuerpo HTTP usa tipos estrictos; no convierte documentos numéricos a texto.
export const appointmentSchema = z.strictObject({
  medicoId: z
    .number({ error: 'medicoId debe ser el id numérico de un médico' })
    .int()
    .positive(),
  id: z.number({ error: 'El id debe ser un número' }).int().positive(),
  paciente: z
    .string({ error: 'El paciente debe ser texto' })
    .trim()
    .min(1, 'El paciente es obligatorio')
    .transform((value) => value.replace(/\s+/g, ' ')),
  documento: z
    .string({ error: 'El documento debe ser texto, entre comillas' })
    .trim()
    .min(1, 'El documento es obligatorio'),
  especialidad: specialtySchema,
  fecha: z.iso.date({
    error: 'La fecha debe ser válida y tener formato AAAA-MM-DD',
  }),
  hora: z
    .string({ error: 'La hora debe ser texto' })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm'),
  confirmado: z.boolean({ error: 'Confirmado debe ser true o false' }),
  observaciones: z.string().trim().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

// En PUT el identificador de la URL es la referencia principal.
export const updateAppointmentSchema = appointmentSchema.extend({
  id: appointmentSchema.shape.id.optional(),
});

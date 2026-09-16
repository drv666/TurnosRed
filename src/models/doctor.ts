import type { z } from 'zod';
import type { doctorSchema } from '../schemas/doctor.schema.js';

export type Doctor = z.infer<typeof doctorSchema>;

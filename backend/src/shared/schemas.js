import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD')
  .transform((valor) => new Date(`${valor}T00:00:00Z`));

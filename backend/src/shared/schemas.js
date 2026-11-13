import { z } from 'zod';

const idSchema = z.coerce.number().int().positive();

export const idParamSchema = z.object({ id: idSchema });

export const fotoParamsSchema = idParamSchema.extend({ fotoId: idSchema });

export const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD')
  .transform((valor) => new Date(`${valor}T00:00:00Z`));

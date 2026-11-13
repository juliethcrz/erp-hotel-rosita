import { z } from 'zod';

const MAXIMO_DIAS = 366;
const fechaTexto = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD');

const DIA_MS = 24 * 60 * 60 * 1000;

export const rangoReporteSchema = z
  .object({ desde: fechaTexto, hasta: fechaTexto })
  .refine(({ desde, hasta }) => hasta >= desde, {
    message: 'La fecha final no puede ser anterior a la inicial',
    path: ['hasta'],
  })
  .refine(({ desde, hasta }) => (Date.parse(hasta) - Date.parse(desde)) / DIA_MS < MAXIMO_DIAS, {
    message: `El periodo puede tener máximo ${MAXIMO_DIAS} días`,
    path: ['hasta'],
  });

export const TIPOS_REPORTE = ['ingresos', 'ocupacion', 'caja'];

export const reporteParamsSchema = z.object({ tipo: z.enum(TIPOS_REPORTE) });

export const exportarQuerySchema = rangoReporteSchema.and(
  z.object({ formato: z.enum(['pdf', 'xlsx']) }),
);

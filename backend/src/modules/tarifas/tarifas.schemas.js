import { z } from 'zod';
import { fechaSchema } from '../../shared/schemas.js';

const tarifa = z.number().int().positive();

export const actualizarTipoSchema = z
  .object({ tarifaBase: tarifa, descripcion: z.string().trim().max(300).nullable() })
  .partial();

const camposTemporada = z.object({
  nombre: z.string().trim().min(3).max(60),
  fechaInicio: fechaSchema,
  fechaFin: fechaSchema,
  activa: z.boolean(),
  tarifas: z
    .array(z.object({ tipoHabitacionId: z.number().int().positive(), tarifa }))
    .min(1, 'Debe definir al menos una tarifa'),
});

const fechasEnOrden = (datos) =>
  !datos.fechaInicio || !datos.fechaFin || datos.fechaFin >= datos.fechaInicio;
const mensajeFechas = {
  message: 'La fecha final no puede ser anterior a la inicial',
  path: ['fechaFin'],
};

export const crearTemporadaSchema = camposTemporada
  .partial({ activa: true })
  .refine(fechasEnOrden, mensajeFechas);

export const actualizarTemporadaSchema = camposTemporada
  .partial()
  .refine(fechasEnOrden, mensajeFechas);

export const cotizarSchema = z
  .object({
    tipoId: z.coerce.number().int().positive(),
    llegada: fechaSchema,
    salida: fechaSchema,
  })
  .refine(({ llegada, salida }) => salida > llegada, {
    message: 'La fecha de salida debe ser posterior a la de llegada',
    path: ['salida'],
  });

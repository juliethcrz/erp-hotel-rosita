import { z } from 'zod';
import { fechaSchema } from '../../shared/schemas.js';

export const ESTADOS_HABITACION = ['DISPONIBLE', 'OCUPADA', 'EN_LIMPIEZA', 'EN_MANTENIMIENTO'];

export const crearHabitacionSchema = z.object({
  numero: z.string().trim().min(1).max(10),
  piso: z.number().int().min(1),
  tipoId: z.number().int().positive(),
  nombre: z.string().trim().max(60).optional().nullable(),
  descripcion: z.string().trim().max(500).optional().nullable(),
});

export const actualizarHabitacionSchema = crearHabitacionSchema
  .extend({ activa: z.boolean() })
  .partial();

export const cambiarEstadoSchema = z.object({
  estado: z.enum(ESTADOS_HABITACION),
});

export const rangoFechasSchema = z
  .object({ llegada: fechaSchema, salida: fechaSchema })
  .refine(({ llegada, salida }) => salida > llegada, {
    message: 'La fecha de salida debe ser posterior a la de llegada',
    path: ['salida'],
  });

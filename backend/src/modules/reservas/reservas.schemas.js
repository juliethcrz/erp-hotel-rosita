import { z } from 'zod';
import { fechaSchema } from '../../shared/schemas.js';

const id = z.number().int().positive();

const pagoSchema = z.object({
  metodo: z.enum(['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA', 'TRANSFERENCIA']),
  monto: z.number().int().positive(),
});

export const cobroSchema = z.object({
  pagos: z.array(pagoSchema).default([]),
});

export const crearReservaSchema = z
  .object({
    titularId: id,
    fechaLlegada: fechaSchema,
    fechaSalida: fechaSchema,
    habitaciones: z
      .array(z.object({ habitacionId: id, huespedes: z.array(id).default([]) }))
      .min(1, 'Seleccione al menos una habitación'),
    descuentoPorcentaje: z.number().int().min(0).max(100).default(0),
    observaciones: z.string().trim().max(500).optional().nullable(),
    anticipo: z.object({ pagos: z.array(pagoSchema).min(1) }).optional(),
  })
  .refine(({ fechaLlegada, fechaSalida }) => fechaSalida > fechaLlegada, {
    message: 'La fecha de salida debe ser posterior a la de llegada',
    path: ['fechaSalida'],
  });

export const consumoSchema = z.object({
  productoId: id,
  cantidad: z.number().int().positive().max(50),
});

export const listarReservasSchema = z.object({
  estado: z
    .enum(['PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'NO_SHOW'])
    .optional(),
  buscar: z.string().trim().optional(),
});

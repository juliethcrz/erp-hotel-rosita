import { z } from 'zod';
import { fechaSchema } from '../../shared/schemas.js';

const textoOpcional = (max) => z.string().trim().max(max).optional().nullable();

export const crearClienteSchema = z.object({
  nombres: z.string().trim().min(2).max(80),
  apellidos: z.string().trim().min(2).max(80),
  tipoDocumento: z.enum(['CC', 'CE', 'PASAPORTE']),
  numeroDocumento: z.string().trim().min(4).max(20),
  fechaNacimiento: fechaSchema.optional().nullable(),
  telefono: textoOpcional(20),
  email: z.string().trim().toLowerCase().email('Correo no válido').optional().nullable(),
  observaciones: textoOpcional(500),
});

export const actualizarClienteSchema = crearClienteSchema.partial();

export const buscarClientesSchema = z.object({
  buscar: z.string().trim().optional(),
});

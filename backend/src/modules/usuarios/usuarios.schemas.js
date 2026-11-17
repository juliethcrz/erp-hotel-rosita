import { z } from 'zod';

const ROLES = ['ADMIN', 'RECEPCIONISTA', 'HOUSEKEEPING'];
const password = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres');

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  apellido: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email('Correo no válido'),
  rol: z.enum(ROLES),
  password,
});

export const actualizarUsuarioSchema = crearUsuarioSchema
  .omit({ password: true })
  .extend({ activo: z.boolean() })
  .partial();

export const restablecerPasswordSchema = z.object({ password });

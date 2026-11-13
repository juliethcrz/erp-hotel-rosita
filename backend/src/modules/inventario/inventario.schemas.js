import { z } from 'zod';

const id = z.number().int().positive();
const textoOpcional = (max) => z.string().trim().max(max).optional().nullable();

const camposProducto = z.object({
  codigo: z.string().trim().min(1).max(10),
  nombre: z.string().trim().min(2).max(100),
  categoriaId: id,
  precioVenta: z.number().int().positive(),
  costo: z.number().int().min(0),
  stockMinimo: z.number().int().min(0),
});

export const crearProductoSchema = camposProducto.extend({
  stockInicial: z.number().int().min(0).default(0),
});

export const actualizarProductoSchema = camposProducto.extend({ activo: z.boolean() }).partial();

export const ajusteSchema = z.object({
  cantidad: z
    .number()
    .int()
    .refine((valor) => valor !== 0, 'La cantidad del ajuste no puede ser cero'),
  observacion: z.string().trim().min(3, 'Explique el motivo del ajuste').max(200),
});

export const proveedorSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  nit: textoOpcional(20),
  contacto: textoOpcional(80),
  telefono: textoOpcional(20),
  email: z.string().trim().toLowerCase().email('Correo no válido').optional().nullable(),
});

export const compraSchema = z.object({
  proveedorId: id,
  detalles: z
    .array(
      z.object({
        productoId: id,
        cantidad: z.number().int().positive(),
        costoUnitario: z.number().int().positive(),
      }),
    )
    .min(1, 'Agregue al menos un producto a la compra'),
});

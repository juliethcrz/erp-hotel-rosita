import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';

/**
 * Descuenta unidades del stock dentro de una transacción y deja el
 * movimiento registrado. Falla si no hay unidades suficientes.
 */
export async function descontarStock(
  tx,
  { productoId, cantidad, motivo, usuarioId, consumoId = null, ventaId = null, observacion = null },
) {
  const producto = await tx.producto.findUnique({ where: { id: productoId } });

  if (!producto?.activo) {
    throw new AppError('El producto no existe o está inactivo', 404);
  }
  if (producto.stockActual < cantidad) {
    throw new AppError(`Solo quedan ${producto.stockActual} unidades de ${producto.nombre}`, 409);
  }

  const actualizado = await tx.producto.update({
    where: { id: productoId },
    data: { stockActual: { decrement: cantidad } },
  });

  await tx.movimientoInventario.create({
    data: {
      productoId,
      motivo,
      cantidad: -cantidad,
      stockResultante: actualizado.stockActual,
      consumoId,
      ventaId,
      observacion,
      usuarioId,
    },
  });

  return actualizado;
}

export function listarProductos() {
  return prisma.producto.findMany({
    where: { activo: true },
    orderBy: [{ categoria: { nombre: 'asc' } }, { nombre: 'asc' }],
    include: { categoria: { select: { nombre: true } } },
  });
}

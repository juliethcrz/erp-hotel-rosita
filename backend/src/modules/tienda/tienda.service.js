import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { registrarCobro } from '../caja/caja.service.js';
import { descontarStock } from '../inventario/inventario.service.js';

/**
 * Venta de mostrador a una persona de paso: se paga en el momento, entra a la
 * caja abierta y descuenta el stock. Si falta stock de un producto, no se
 * registra nada.
 */
export function venderDirecto(
  { items, pagos, clienteId = null, compradorNombre = null },
  usuarioId,
) {
  const ids = items.map((item) => item.productoId);
  if (new Set(ids).size !== ids.length) {
    throw new AppError('Hay productos repetidos en la venta');
  }

  return prisma.$transaction(async (tx) => {
    const productos = await tx.producto.findMany({ where: { id: { in: ids }, activo: true } });
    if (productos.length !== ids.length) {
      throw new AppError('Alguno de los productos no existe o está inactivo', 404);
    }

    const detalles = items.map(({ productoId, cantidad }) => {
      const producto = productos.find((p) => p.id === productoId);
      return {
        tipo: 'PRODUCTO',
        productoId,
        descripcion: producto.nombre,
        cantidad,
        precioUnitario: producto.precioVenta,
      };
    });

    const venta = await registrarCobro(tx, {
      tipo: 'VENTA_DIRECTA',
      clienteId,
      compradorNombre: compradorNombre || null,
      detalles,
      pagos,
      usuarioId,
    });

    for (const { productoId, cantidad } of items) {
      await descontarStock(tx, {
        productoId,
        cantidad,
        motivo: 'VENTA',
        usuarioId,
        ventaId: venta.id,
        observacion: `Venta en tienda, comprobante ${venta.id}`,
      });
    }

    return venta;
  });
}

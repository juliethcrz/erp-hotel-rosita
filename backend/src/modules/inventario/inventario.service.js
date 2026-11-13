import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { notificar } from '../notificaciones/notificaciones.service.js';

async function avisarStockBajo(tx, anterior, actual) {
  const cruzoElMinimo =
    anterior.stockActual > anterior.stockMinimo && actual.stockActual <= actual.stockMinimo;

  if (cruzoElMinimo) {
    await notificar(tx, ['ADMIN'], {
      titulo: `Stock bajo: ${actual.nombre}`,
      mensaje: `Quedan ${actual.stockActual} unidades; el mínimo es ${actual.stockMinimo}. Conviene hacer pedido al proveedor.`,
    });
  }
}

/**
 * Descuenta unidades del stock dentro de una transacción, deja el movimiento
 * registrado y avisa al administrador si el producto llega a su mínimo.
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

  await avisarStockBajo(tx, producto, actualizado);
  return actualizado;
}

// ─── Productos ─────────────────────────────────────────────────

export async function listarProductos({ incluirInactivos = false } = {}) {
  const productos = await prisma.producto.findMany({
    where: incluirInactivos ? {} : { activo: true },
    orderBy: [{ categoria: { nombre: 'asc' } }, { nombre: 'asc' }],
    include: { categoria: { select: { nombre: true } } },
  });

  return productos.map((producto) => ({
    ...producto,
    stockBajo: producto.stockActual <= producto.stockMinimo,
  }));
}

export function listarCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

export function crearProducto({ stockInicial, ...datos }, usuarioId) {
  return prisma.producto.create({
    data: {
      ...datos,
      stockActual: stockInicial,
      movimientos:
        stockInicial > 0
          ? {
              create: {
                motivo: 'AJUSTE',
                cantidad: stockInicial,
                stockResultante: stockInicial,
                observacion: 'Inventario inicial',
                usuarioId,
              },
            }
          : undefined,
    },
  });
}

export function actualizarProducto(id, datos) {
  return prisma.producto.update({ where: { id }, data: datos });
}

export function ajustarStock(id, { cantidad, observacion }, usuarioId) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new AppError('El producto no existe', 404);
    }
    if (producto.stockActual + cantidad < 0) {
      throw new AppError(`El stock no puede quedar negativo (hay ${producto.stockActual})`);
    }

    const actualizado = await tx.producto.update({
      where: { id },
      data: { stockActual: { increment: cantidad } },
    });

    await tx.movimientoInventario.create({
      data: {
        productoId: id,
        motivo: 'AJUSTE',
        cantidad,
        stockResultante: actualizado.stockActual,
        observacion,
        usuarioId,
      },
    });

    await avisarStockBajo(tx, producto, actualizado);
    return actualizado;
  });
}

export function listarMovimientos(productoId) {
  return prisma.movimientoInventario.findMany({
    where: { productoId },
    orderBy: { creadoEn: 'desc' },
    take: 100,
    include: { usuario: { select: { nombre: true } } },
  });
}

// ─── Proveedores ───────────────────────────────────────────────

export function listarProveedores() {
  return prisma.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
}

export function crearProveedor(datos) {
  return prisma.proveedor.create({ data: datos });
}

export function actualizarProveedor(id, datos) {
  return prisma.proveedor.update({ where: { id }, data: datos });
}

// ─── Compras ───────────────────────────────────────────────────

export function listarCompras() {
  return prisma.compra.findMany({
    orderBy: { creadoEn: 'desc' },
    take: 50,
    include: {
      proveedor: { select: { nombre: true } },
      creadoPor: { select: { nombre: true } },
      detalles: { include: { producto: { select: { nombre: true } } } },
    },
  });
}

/**
 * Registra una compra al proveedor ya recibida: sube el stock de cada producto,
 * actualiza su costo al último pagado y deja los movimientos de entrada.
 */
export function registrarCompra({ proveedorId, detalles }, usuarioId) {
  const ids = detalles.map((detalle) => detalle.productoId);
  if (new Set(ids).size !== ids.length) {
    throw new AppError('Hay productos repetidos en la compra');
  }

  return prisma.$transaction(async (tx) => {
    const proveedor = await tx.proveedor.findUnique({ where: { id: proveedorId } });
    if (!proveedor) {
      throw new AppError('El proveedor no existe', 404);
    }

    const productos = await tx.producto.count({ where: { id: { in: ids } } });
    if (productos !== ids.length) {
      throw new AppError('Alguno de los productos no existe', 404);
    }

    const compra = await tx.compra.create({
      data: {
        proveedorId,
        estado: 'CONFIRMADA',
        confirmadaEn: new Date(),
        total: detalles.reduce((suma, d) => suma + d.cantidad * d.costoUnitario, 0),
        creadoPorId: usuarioId,
        detalles: { create: detalles },
      },
    });

    for (const { productoId, cantidad, costoUnitario } of detalles) {
      const actualizado = await tx.producto.update({
        where: { id: productoId },
        data: { stockActual: { increment: cantidad }, costo: costoUnitario },
      });
      await tx.movimientoInventario.create({
        data: {
          productoId,
          motivo: 'COMPRA',
          cantidad,
          stockResultante: actualizado.stockActual,
          compraId: compra.id,
          observacion: `Compra a ${proveedor.nombre}`,
          usuarioId,
        },
      });
    }

    return compra;
  });
}

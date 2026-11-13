import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { obtenerConfiguracion } from '../../shared/utils/configuracion.js';

const METODOS = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA', 'TRANSFERENCIA'];
const IVA = 0.19;

export async function obtenerCajaAbierta(tx = prisma) {
  const caja = await tx.caja.findFirst({ where: { estado: 'ABIERTA' } });
  if (!caja) {
    throw new AppError('Debe abrir la caja del día antes de registrar cobros', 409);
  }
  return caja;
}

function resumir(caja) {
  const porMetodo = Object.fromEntries(METODOS.map((metodo) => [metodo, 0]));
  let ingresos = 0;
  let egresos = 0;

  for (const movimiento of caja.movimientos) {
    const signo = movimiento.tipo === 'INGRESO' ? 1 : -1;
    porMetodo[movimiento.metodo] += signo * movimiento.monto;
    if (signo > 0) ingresos += movimiento.monto;
    else egresos += movimiento.monto;
  }

  const neto = ingresos - egresos;
  return {
    porMetodo,
    ingresos,
    egresos,
    neto,
    efectivoEnCaja: caja.montoBase + porMetodo.EFECTIVO,
  };
}

const incluirDetalle = {
  abiertaPor: { select: { nombre: true, apellido: true } },
  cerradaPor: { select: { nombre: true, apellido: true } },
  movimientos: {
    orderBy: { creadoEn: 'desc' },
    include: { usuario: { select: { nombre: true } } },
  },
};

export async function actual() {
  const caja = await prisma.caja.findFirst({
    where: { estado: 'ABIERTA' },
    include: incluirDetalle,
  });
  return caja ? { ...caja, resumen: resumir(caja) } : null;
}

export async function abrir(usuarioId) {
  const abierta = await prisma.caja.findFirst({ where: { estado: 'ABIERTA' } });
  if (abierta) {
    throw new AppError('Ya hay una caja abierta', 409);
  }

  const montoBase = Number(await obtenerConfiguracion('caja_monto_base', '100000'));
  return prisma.caja.create({ data: { montoBase, abiertaPorId: usuarioId } });
}

export async function cerrar(usuarioId) {
  const caja = await obtenerCajaAbierta();
  const cerrada = await prisma.caja.update({
    where: { id: caja.id },
    data: { estado: 'CERRADA', cerradaPorId: usuarioId, cerradaEn: new Date() },
    include: incluirDetalle,
  });
  return { ...cerrada, resumen: resumir(cerrada) };
}

export async function historial() {
  const cajas = await prisma.caja.findMany({
    where: { estado: 'CERRADA' },
    orderBy: { abiertaEn: 'desc' },
    take: 60,
    include: incluirDetalle,
  });
  return cajas.map(({ movimientos, ...caja }) => ({
    ...caja,
    resumen: resumir({ ...caja, movimientos }),
  }));
}

/**
 * Registra un cobro completo dentro de una transacción: la venta con su
 * comprobante, sus líneas, los pagos por método y los ingresos en la caja
 * abierta. Los precios ya incluyen IVA, así que este se descompone del total.
 */
export async function registrarCobro(
  tx,
  {
    tipo,
    reservaId = null,
    clienteId = null,
    compradorNombre = null,
    detalles,
    descuento = 0,
    pagos,
    usuarioId,
  },
) {
  const caja = await obtenerCajaAbierta(tx);
  const bruto = detalles.reduce(
    (suma, detalle) => suma + detalle.cantidad * detalle.precioUnitario,
    0,
  );
  const total = bruto - descuento;
  const pagado = pagos.reduce((suma, pago) => suma + pago.monto, 0);

  if (pagado !== total) {
    throw new AppError(`Los pagos suman ${pagado} y el valor a cobrar es ${total}`);
  }

  const subtotal = Math.round(total / (1 + IVA));

  const venta = await tx.venta.create({
    data: {
      tipo,
      reservaId,
      clienteId,
      compradorNombre,
      cajaId: caja.id,
      subtotal,
      iva: total - subtotal,
      descuento,
      total,
      creadoPorId: usuarioId,
      detalles: {
        create: detalles.map((detalle) => ({
          ...detalle,
          total: detalle.cantidad * detalle.precioUnitario,
        })),
      },
      pagos: { create: pagos },
    },
    include: { detalles: true, pagos: true },
  });

  await tx.cajaMovimiento.createMany({
    data: pagos.map((pago) => ({
      cajaId: caja.id,
      tipo: 'INGRESO',
      metodo: pago.metodo,
      monto: pago.monto,
      descripcion: compradorNombre
        ? `Comprobante ${venta.id} · ${compradorNombre}`
        : `Comprobante ${venta.id}`,
      ventaId: venta.id,
      usuarioId,
    })),
  });

  return venta;
}

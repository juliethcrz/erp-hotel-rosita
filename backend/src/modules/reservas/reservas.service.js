import crypto from 'node:crypto';
import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { obtenerConfiguracion } from '../../shared/utils/configuracion.js';
import { hoyEnColombia, momentoEnColombia } from '../../shared/utils/fechas.js';
import { obtenerCajaAbierta, registrarCobro } from '../caja/caja.service.js';
import { ESTADOS_RESERVA_ACTIVOS } from '../habitaciones/habitaciones.service.js';
import { descontarStock } from '../inventario/inventario.service.js';
import { notificar } from '../notificaciones/notificaciones.service.js';
import { calcularEstadia } from '../tarifas/tarifas.service.js';

const PORCENTAJE_ANTICIPO = 0.5;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const MS_POR_HORA = 60 * 60 * 1000;
const HORAS_CANCELACION_CON_DEVOLUCION = 24;

const incluirDetalle = {
  titular: true,
  habitaciones: {
    orderBy: { habitacionId: 'asc' },
    include: { habitacion: { include: { tipo: true } } },
  },
  huespedes: { include: { cliente: true, habitacion: { select: { numero: true } } } },
  consumos: {
    orderBy: { creadoEn: 'asc' },
    include: { producto: { select: { codigo: true, nombre: true } } },
  },
  ventas: { orderBy: { creadoEn: 'asc' }, include: { pagos: true, detalles: true } },
};

function sumar(lista, valor) {
  return lista.reduce((total, elemento) => total + valor(elemento), 0);
}

function calcularResumen(reserva) {
  const totalHabitaciones = sumar(reserva.habitaciones, (h) => h.subtotal);
  const descuento = Math.round((totalHabitaciones * reserva.descuentoPorcentaje) / 100);
  const totalEstadia = totalHabitaciones - descuento;
  const pagadoEstadia = sumar(
    reserva.ventas.filter(
      (venta) => venta.estado === 'PAGADA' && ['ANTICIPO', 'SALDO_CHECKIN'].includes(venta.tipo),
    ),
    (venta) => venta.total,
  );
  const consumosPendientes = sumar(
    reserva.consumos.filter((consumo) => !consumo.pagado),
    (consumo) => consumo.cantidad * consumo.precioUnitario,
  );

  return {
    totalHabitaciones,
    descuento,
    totalEstadia,
    anticipoRequerido: Math.round(totalEstadia * PORCENTAJE_ANTICIPO),
    pagadoEstadia,
    saldoEstadia: totalEstadia - pagadoEstadia,
    consumosPendientes,
  };
}

async function buscarReserva(tx, id) {
  const reserva = await tx.reserva.findUnique({ where: { id }, include: incluirDetalle });
  if (!reserva) {
    throw new AppError('La reserva no existe', 404);
  }
  return reserva;
}

async function detalle(tx, id) {
  const reserva = await buscarReserva(tx, id);
  return { ...reserva, resumen: calcularResumen(reserva) };
}

function exigirEstado(reserva, estados, mensaje) {
  if (!estados.includes(reserva.estado)) {
    throw new AppError(mensaje, 409);
  }
}

function generarCodigo() {
  return `RS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export function listar({ estado, buscar }) {
  const where = { estado };

  if (buscar) {
    where.OR = [
      { codigo: { contains: buscar, mode: 'insensitive' } },
      { titular: { nombres: { contains: buscar, mode: 'insensitive' } } },
      { titular: { apellidos: { contains: buscar, mode: 'insensitive' } } },
      { titular: { numeroDocumento: { contains: buscar } } },
    ];
  }

  return prisma.reserva.findMany({
    where,
    orderBy: { fechaLlegada: 'desc' },
    take: 100,
    include: {
      titular: { select: { nombres: true, apellidos: true } },
      habitaciones: { include: { habitacion: { select: { numero: true } } } },
    },
  });
}

export function obtener(id) {
  return detalle(prisma, id);
}

async function validarHabitaciones(tx, { habitaciones, fechaLlegada, fechaSalida }) {
  const ids = habitaciones.map((h) => h.habitacionId);
  if (new Set(ids).size !== ids.length) {
    throw new AppError('Hay habitaciones repetidas en la reserva');
  }

  const huespedes = habitaciones.flatMap((h) => h.huespedes);
  if (new Set(huespedes).size !== huespedes.length) {
    throw new AppError('Un huésped no puede estar en dos habitaciones de la misma reserva');
  }

  const encontradas = await tx.habitacion.findMany({
    where: { id: { in: ids }, activa: true },
    include: { tipo: true },
  });
  if (encontradas.length !== ids.length) {
    throw new AppError('Alguna de las habitaciones no existe', 404);
  }

  const enMantenimiento = encontradas.find((h) => h.estado === 'EN_MANTENIMIENTO');
  if (enMantenimiento) {
    throw new AppError(`La habitación ${enMantenimiento.numero} está en mantenimiento`, 409);
  }

  const cruce = await tx.reservaHabitacion.findFirst({
    where: {
      habitacionId: { in: ids },
      reserva: {
        estado: { in: ESTADOS_RESERVA_ACTIVOS },
        fechaLlegada: { lt: fechaSalida },
        fechaSalida: { gt: fechaLlegada },
      },
    },
    include: { habitacion: { select: { numero: true } } },
  });
  if (cruce) {
    throw new AppError(
      `La habitación ${cruce.habitacion.numero} ya está reservada en esas fechas`,
      409,
    );
  }

  for (const seleccion of habitaciones) {
    const habitacion = encontradas.find((h) => h.id === seleccion.habitacionId);
    if (seleccion.huespedes.length > habitacion.tipo.capacidadMaxima) {
      throw new AppError(
        `La habitación ${habitacion.numero} admite máximo ${habitacion.tipo.capacidadMaxima} huéspedes`,
      );
    }
  }

  return encontradas;
}

async function cobrarAnticipo(tx, reserva, pagos, usuarioId) {
  const { anticipoRequerido } = calcularResumen(reserva);

  await registrarCobro(tx, {
    tipo: 'ANTICIPO',
    reservaId: reserva.id,
    clienteId: reserva.titularId,
    detalles: [
      {
        tipo: 'HABITACION',
        descripcion: `Anticipo del 50 % de la reserva ${reserva.codigo}`,
        cantidad: 1,
        precioUnitario: anticipoRequerido,
      },
    ],
    pagos,
    usuarioId,
  });

  await tx.reserva.update({ where: { id: reserva.id }, data: { estado: 'CONFIRMADA' } });
}

export async function crear(datos, usuarioId) {
  const { titularId, fechaLlegada, fechaSalida, habitaciones, anticipo, ...resto } = datos;

  if (fechaLlegada < hoyEnColombia()) {
    throw new AppError('La fecha de llegada no puede ser anterior a hoy');
  }

  const noches = Math.round((fechaSalida - fechaLlegada) / MS_POR_DIA);

  return prisma.$transaction(async (tx) => {
    const titular = await tx.cliente.findUnique({ where: { id: titularId } });
    if (!titular) {
      throw new AppError('El cliente titular no existe', 404);
    }

    const encontradas = await validarHabitaciones(tx, { habitaciones, fechaLlegada, fechaSalida });

    const lineas = [];
    for (const seleccion of habitaciones) {
      const habitacion = encontradas.find((h) => h.id === seleccion.habitacionId);
      const { total } = await calcularEstadia(habitacion.tipoId, fechaLlegada, fechaSalida);
      lineas.push({
        habitacionId: habitacion.id,
        noches,
        subtotal: total,
        tarifaNoche: Math.round(total / noches),
      });
    }

    const reserva = await tx.reserva.create({
      data: {
        ...resto,
        codigo: generarCodigo(),
        titularId,
        fechaLlegada,
        fechaSalida,
        creadoPorId: usuarioId,
        habitaciones: { create: lineas },
        huespedes: {
          create: habitaciones.flatMap((h) =>
            h.huespedes.map((clienteId) => ({ clienteId, habitacionId: h.habitacionId })),
          ),
        },
      },
      include: incluirDetalle,
    });

    if (anticipo) {
      await cobrarAnticipo(tx, reserva, anticipo.pagos, usuarioId);
    }

    return detalle(tx, reserva.id);
  });
}

export function registrarAnticipo(id, pagos, usuarioId) {
  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(reserva, ['PENDIENTE'], 'La reserva ya tiene el anticipo registrado');
    await cobrarAnticipo(tx, reserva, pagos, usuarioId);
    return detalle(tx, id);
  });
}

export function checkin(id, pagos, usuarioId) {
  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(reserva, ['CONFIRMADA'], 'Solo se puede hacer check-in a reservas confirmadas');

    const hoy = hoyEnColombia();
    if (hoy < reserva.fechaLlegada) {
      throw new AppError('El check-in se puede hacer desde el día de llegada', 409);
    }
    if (hoy >= reserva.fechaSalida) {
      throw new AppError('La fecha de salida de esta reserva ya pasó', 409);
    }

    const noLista = reserva.habitaciones.find((h) => h.habitacion.estado !== 'DISPONIBLE');
    if (noLista) {
      throw new AppError(`La habitación ${noLista.habitacion.numero} todavía no está lista`, 409);
    }

    const { saldoEstadia } = calcularResumen(reserva);
    if (saldoEstadia > 0) {
      await registrarCobro(tx, {
        tipo: 'SALDO_CHECKIN',
        reservaId: id,
        clienteId: reserva.titularId,
        detalles: [
          {
            tipo: 'HABITACION',
            descripcion: `Saldo de la estadía, reserva ${reserva.codigo}`,
            cantidad: 1,
            precioUnitario: saldoEstadia,
          },
        ],
        pagos,
        usuarioId,
      });
    } else if (pagos.length > 0) {
      throw new AppError('La estadía ya está paga, no hay saldo por cobrar');
    }

    await tx.habitacion.updateMany({
      where: { id: { in: reserva.habitaciones.map((h) => h.habitacionId) } },
      data: { estado: 'OCUPADA' },
    });
    await tx.reserva.update({
      where: { id },
      data: { estado: 'EN_CURSO', checkinEn: new Date() },
    });

    return detalle(tx, id);
  });
}

export function registrarConsumo(id, { productoId, cantidad }, usuarioId) {
  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(
      reserva,
      ['EN_CURSO'],
      'Solo se pueden cargar consumos a reservas con el huésped hospedado',
    );

    const producto = await tx.producto.findUnique({ where: { id: productoId } });
    if (!producto) {
      throw new AppError('El producto no existe', 404);
    }

    const consumo = await tx.consumoHabitacion.create({
      data: {
        reservaId: id,
        productoId,
        cantidad,
        precioUnitario: producto.precioVenta,
        registradoPorId: usuarioId,
      },
    });

    await descontarStock(tx, {
      productoId,
      cantidad,
      motivo: 'CONSUMO_HABITACION',
      usuarioId,
      consumoId: consumo.id,
      observacion: `Cargado a la reserva ${reserva.codigo}`,
    });

    return detalle(tx, id);
  });
}

export function checkout(id, pagos, usuarioId) {
  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(reserva, ['EN_CURSO'], 'Solo se puede hacer check-out a reservas en curso');

    const { saldoEstadia } = calcularResumen(reserva);
    if (saldoEstadia > 0) {
      throw new AppError('La reserva tiene saldo de estadía pendiente', 409);
    }

    const pendientes = reserva.consumos.filter((consumo) => !consumo.pagado);
    if (pendientes.length > 0) {
      const venta = await registrarCobro(tx, {
        tipo: 'CONSUMOS_CHECKOUT',
        reservaId: id,
        clienteId: reserva.titularId,
        detalles: pendientes.map((consumo) => ({
          tipo: 'PRODUCTO',
          productoId: consumo.productoId,
          descripcion: consumo.producto.nombre,
          cantidad: consumo.cantidad,
          precioUnitario: consumo.precioUnitario,
        })),
        pagos,
        usuarioId,
      });
      await tx.consumoHabitacion.updateMany({
        where: { id: { in: pendientes.map((consumo) => consumo.id) } },
        data: { pagado: true, ventaId: venta.id },
      });
    } else if (pagos.length > 0) {
      throw new AppError('No hay consumos pendientes por cobrar');
    }

    const habitacionIds = reserva.habitaciones.map((h) => h.habitacionId);
    await tx.habitacion.updateMany({
      where: { id: { in: habitacionIds } },
      data: { estado: 'EN_LIMPIEZA' },
    });
    await tx.limpieza.createMany({
      data: habitacionIds.map((habitacionId) => ({ habitacionId, reservaId: id })),
    });

    for (const { habitacion } of reserva.habitaciones) {
      await notificar(tx, ['HOUSEKEEPING'], {
        titulo: `Habitación ${habitacion.numero} pendiente de limpieza`,
        mensaje: `El huésped hizo check-out. La habitación ${habitacion.numero} está lista para limpiar.`,
        habitacionId: habitacion.id,
      });
    }

    await tx.reserva.update({
      where: { id },
      data: { estado: 'FINALIZADA', checkoutEn: new Date() },
    });

    return detalle(tx, id);
  });
}

export async function cancelar(id, usuarioId) {
  const horaCheckin = await obtenerConfiguracion('hora_checkin', '14:00');

  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(
      reserva,
      ['PENDIENTE', 'CONFIRMADA'],
      'Solo se pueden cancelar reservas pendientes o confirmadas',
    );

    const anticipos = reserva.ventas.filter(
      (venta) => venta.tipo === 'ANTICIPO' && venta.estado === 'PAGADA',
    );
    const horasParaLlegada =
      (momentoEnColombia(reserva.fechaLlegada, horaCheckin) - Date.now()) / MS_POR_HORA;
    const devolver = anticipos.length > 0 && horasParaLlegada > HORAS_CANCELACION_CON_DEVOLUCION;

    if (devolver) {
      const caja = await obtenerCajaAbierta(tx);
      for (const venta of anticipos) {
        await tx.venta.update({ where: { id: venta.id }, data: { estado: 'ANULADA' } });
        await tx.cajaMovimiento.createMany({
          data: venta.pagos.map((pago) => ({
            cajaId: caja.id,
            tipo: 'EGRESO',
            metodo: pago.metodo,
            monto: pago.monto,
            descripcion: `Devolución del anticipo, reserva ${reserva.codigo}`,
            ventaId: venta.id,
            usuarioId,
          })),
        });
      }
    }

    await tx.reserva.update({ where: { id }, data: { estado: 'CANCELADA' } });

    const resultado = await detalle(tx, id);
    return {
      ...resultado,
      devolucion: devolver ? anticipos.reduce((total, venta) => total + venta.total, 0) : 0,
    };
  });
}

export async function marcarNoShow(id) {
  const [horaCheckin, horasGracia] = await Promise.all([
    obtenerConfiguracion('hora_checkin', '14:00'),
    obtenerConfiguracion('no_show_horas', '2'),
  ]);

  return prisma.$transaction(async (tx) => {
    const reserva = await buscarReserva(tx, id);
    exigirEstado(
      reserva,
      ['CONFIRMADA'],
      'Solo una reserva confirmada puede marcarse como no-show',
    );

    const limite =
      momentoEnColombia(reserva.fechaLlegada, horaCheckin).getTime() +
      Number(horasGracia) * MS_POR_HORA;
    if (Date.now() < limite) {
      throw new AppError('Todavía no ha pasado el tiempo de gracia para el huésped', 409);
    }

    await tx.reserva.update({ where: { id }, data: { estado: 'NO_SHOW' } });
    return detalle(tx, id);
  });
}

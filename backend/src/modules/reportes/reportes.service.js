import { prisma } from '../../config/database.js';
import { resumir } from '../caja/caja.service.js';
import { diaEnColombia, diasDelPeriodo, fechaDeColumna, instantesDelPeriodo } from './periodo.js';

const METODOS = ['EFECTIVO', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA', 'TRANSFERENCIA'];
const LINEA_DE_NEGOCIO = {
  ANTICIPO: 'ALOJAMIENTO',
  SALDO_CHECKIN: 'ALOJAMIENTO',
  CONSUMOS_CHECKOUT: 'TIENDA',
  VENTA_DIRECTA: 'TIENDA',
};
const ESTADOS_QUE_OCUPAN = ['CONFIRMADA', 'EN_CURSO', 'FINALIZADA'];

const ceros = (claves) => Object.fromEntries(claves.map((clave) => [clave, 0]));
const porcentaje = (parte, total) => (total === 0 ? 0 : Math.round((parte / total) * 1000) / 10);

/**
 * Ingresos efectivamente cobrados en el periodo. Las ventas anuladas (anticipos
 * devueltos al cancelar) no cuentan.
 */
export async function ingresos({ desde, hasta }) {
  const ventas = await prisma.venta.findMany({
    where: { estado: 'PAGADA', creadoEn: instantesDelPeriodo(desde, hasta) },
    orderBy: { creadoEn: 'asc' },
    include: {
      pagos: true,
      reserva: { select: { codigo: true } },
      cliente: { select: { nombres: true, apellidos: true } },
    },
  });

  const porDia = ceros(diasDelPeriodo(desde, hasta));
  const porLinea = ceros(['ALOJAMIENTO', 'TIENDA']);
  const porMetodo = ceros(METODOS);
  const totales = { total: 0, subtotal: 0, iva: 0, descuentos: 0, ventas: ventas.length };

  for (const venta of ventas) {
    totales.total += venta.total;
    totales.subtotal += venta.subtotal;
    totales.iva += venta.iva;
    totales.descuentos += venta.descuento;
    porDia[diaEnColombia(venta.creadoEn)] += venta.total;
    porLinea[LINEA_DE_NEGOCIO[venta.tipo]] += venta.total;
    for (const pago of venta.pagos) porMetodo[pago.metodo] += pago.monto;
  }

  return {
    periodo: { desde, hasta },
    totales: {
      ...totales,
      ticketPromedio: ventas.length ? Math.round(totales.total / ventas.length) : 0,
    },
    porLinea,
    porMetodo,
    porDia: Object.entries(porDia).map(([fecha, total]) => ({ fecha, total })),
    ventas: ventas.map((venta) => ({
      id: venta.id,
      fecha: venta.creadoEn,
      tipo: venta.tipo,
      reserva: venta.reserva?.codigo ?? null,
      cliente: venta.cliente
        ? `${venta.cliente.nombres} ${venta.cliente.apellidos}`
        : (venta.compradorNombre ?? null),
      metodos: [...new Set(venta.pagos.map((pago) => pago.metodo))],
      total: venta.total,
    })),
  };
}

/**
 * Ocupación por noches: cada habitación reservada cuenta una noche por cada
 * día del periodo en que el huésped duerme (llegada <= día < salida).
 */
export async function ocupacion({ desde, hasta }) {
  const dias = diasDelPeriodo(desde, hasta);
  const inicio = fechaDeColumna(desde);
  const finExclusivo = fechaDeColumna(dias.at(-1));
  finExclusivo.setUTCDate(finExclusivo.getUTCDate() + 1);

  const [habitaciones, reservas, movimientoReservas] = await Promise.all([
    prisma.habitacion.findMany({ where: { activa: true }, include: { tipo: true } }),
    prisma.reserva.findMany({
      where: {
        estado: { in: ESTADOS_QUE_OCUPAN },
        fechaLlegada: { lt: finExclusivo },
        fechaSalida: { gt: inicio },
      },
      include: { habitaciones: { include: { habitacion: { include: { tipo: true } } } } },
    }),
    prisma.reserva.groupBy({
      by: ['estado'],
      where: { fechaLlegada: { gte: inicio, lt: finExclusivo } },
      _count: true,
    }),
  ]);

  const nochesPorDia = ceros(dias);
  const tipos = new Map();
  for (const habitacion of habitaciones) {
    const actual = tipos.get(habitacion.tipo.nombre) ?? { habitaciones: 0, noches: 0, ingreso: 0 };
    tipos.set(habitacion.tipo.nombre, { ...actual, habitaciones: actual.habitaciones + 1 });
  }

  let nochesVendidas = 0;
  let ingresoHabitaciones = 0;
  for (const reserva of reservas) {
    const llegada = reserva.fechaLlegada.toISOString().slice(0, 10);
    const salida = reserva.fechaSalida.toISOString().slice(0, 10);
    const nochesEnPeriodo = dias.filter((dia) => dia >= llegada && dia < salida);

    for (const linea of reserva.habitaciones) {
      const tarifaPromedio = linea.noches ? linea.subtotal / linea.noches : 0;
      const tipo = tipos.get(linea.habitacion.tipo.nombre);
      for (const dia of nochesEnPeriodo) nochesPorDia[dia] += 1;
      nochesVendidas += nochesEnPeriodo.length;
      ingresoHabitaciones += tarifaPromedio * nochesEnPeriodo.length;
      if (tipo) {
        tipo.noches += nochesEnPeriodo.length;
        tipo.ingreso += tarifaPromedio * nochesEnPeriodo.length;
      }
    }
  }

  const nochesDisponibles = habitaciones.length * dias.length;
  const conteoEstados = Object.fromEntries(movimientoReservas.map((g) => [g.estado, g._count]));

  return {
    periodo: { desde, hasta },
    totales: {
      habitaciones: habitaciones.length,
      nochesDisponibles,
      nochesVendidas,
      ocupacion: porcentaje(nochesVendidas, nochesDisponibles),
      tarifaPromedio: nochesVendidas ? Math.round(ingresoHabitaciones / nochesVendidas) : 0,
      ingresoPorHabitacionDisponible: nochesDisponibles
        ? Math.round(ingresoHabitaciones / nochesDisponibles)
        : 0,
      llegadas: reservasQueLlegan(conteoEstados),
      cancelaciones: conteoEstados.CANCELADA ?? 0,
      noShows: conteoEstados.NO_SHOW ?? 0,
    },
    porDia: dias.map((fecha) => ({
      fecha,
      noches: nochesPorDia[fecha],
      ocupacion: porcentaje(nochesPorDia[fecha], habitaciones.length),
    })),
    porTipo: [...tipos].map(([tipo, datos]) => ({
      tipo,
      habitaciones: datos.habitaciones,
      noches: datos.noches,
      ocupacion: porcentaje(datos.noches, datos.habitaciones * dias.length),
      ingreso: Math.round(datos.ingreso),
    })),
  };
}

function reservasQueLlegan(conteoEstados) {
  return ESTADOS_QUE_OCUPAN.reduce((suma, estado) => suma + (conteoEstados[estado] ?? 0), 0);
}

/** Cajas abiertas en el periodo, con sus ingresos y egresos por método de pago. */
export async function caja({ desde, hasta }) {
  const cajas = await prisma.caja.findMany({
    where: { abiertaEn: instantesDelPeriodo(desde, hasta) },
    orderBy: { abiertaEn: 'asc' },
    include: {
      movimientos: true,
      abiertaPor: { select: { nombre: true, apellido: true } },
      cerradaPor: { select: { nombre: true, apellido: true } },
    },
  });

  const totales = { cajas: cajas.length, ingresos: 0, egresos: 0, neto: 0 };
  const porMetodo = ceros(METODOS);

  const detalle = cajas.map(({ movimientos, ...datos }) => {
    const resumen = resumir({ ...datos, movimientos });
    totales.ingresos += resumen.ingresos;
    totales.egresos += resumen.egresos;
    totales.neto += resumen.neto;
    for (const metodo of METODOS) porMetodo[metodo] += resumen.porMetodo[metodo];

    return {
      id: datos.id,
      estado: datos.estado,
      abiertaEn: datos.abiertaEn,
      cerradaEn: datos.cerradaEn,
      abiertaPor: `${datos.abiertaPor.nombre} ${datos.abiertaPor.apellido}`,
      cerradaPor: datos.cerradaPor
        ? `${datos.cerradaPor.nombre} ${datos.cerradaPor.apellido}`
        : null,
      montoBase: datos.montoBase,
      movimientos: movimientos.length,
      ...resumen,
    };
  });

  return { periodo: { desde, hasta }, totales, porMetodo, cajas: detalle };
}

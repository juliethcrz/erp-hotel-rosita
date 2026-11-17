import { prisma } from '../../config/database.js';
import { aTextoFecha, hoyEnColombia } from '../../shared/utils/fechas.js';
import * as cajaService from '../caja/caja.service.js';
import * as habitacionesService from '../habitaciones/habitaciones.service.js';
import { instantesDelPeriodo } from '../reportes/periodo.js';
import * as reportesService from '../reportes/reportes.service.js';

const DIA_MS = 24 * 60 * 60 * 1000;

const resumenReserva = {
  id: true,
  codigo: true,
  estado: true,
  fechaLlegada: true,
  fechaSalida: true,
  titular: { select: { nombres: true, apellidos: true, telefono: true } },
  habitaciones: { select: { habitacion: { select: { numero: true } } } },
};

const aplanarReserva = ({ titular, habitaciones, ...reserva }) => ({
  ...reserva,
  titular: `${titular.nombres} ${titular.apellidos}`,
  telefono: titular.telefono,
  habitaciones: habitaciones.map(({ habitacion }) => habitacion.numero),
});

async function estadoHabitaciones() {
  const habitaciones = await habitacionesService.listar();
  const conteo = habitaciones.reduce((total, { estadoRack }) => {
    total[estadoRack] = (total[estadoRack] ?? 0) + 1;
    return total;
  }, {});
  const ocupadas = conteo.OCUPADA ?? 0;
  return {
    total: habitaciones.length,
    conteo,
    ocupacion: habitaciones.length ? Math.round((ocupadas / habitaciones.length) * 100) : 0,
  };
}

/** Reservas que llegan hoy y aún no hacen check-in. */
async function llegadasDeHoy(hoy) {
  const reservas = await prisma.reserva.findMany({
    where: { estado: { in: ['PENDIENTE', 'CONFIRMADA'] }, fechaLlegada: hoy },
    select: resumenReserva,
    orderBy: { codigo: 'asc' },
  });
  return reservas.map(aplanarReserva);
}

/** Huéspedes que deben salir hoy (o que ya debieron salir y siguen en curso). */
async function salidasDeHoy(hoy) {
  const reservas = await prisma.reserva.findMany({
    where: { estado: 'EN_CURSO', fechaSalida: { lte: hoy } },
    select: resumenReserva,
    orderBy: { fechaSalida: 'asc' },
  });
  return reservas.map(aplanarReserva);
}

async function estadoCaja() {
  const caja = await cajaService.actual();
  if (!caja) return null;
  return { id: caja.id, abiertaEn: caja.abiertaEn, ...caja.resumen };
}

async function limpiezas(hoyTexto) {
  const [abiertas, terminadasHoy] = await Promise.all([
    prisma.limpieza.findMany({
      where: { estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
      orderBy: { creadaEn: 'asc' },
      include: {
        habitacion: { select: { numero: true, nombre: true } },
        responsable: { select: { nombre: true } },
      },
    }),
    prisma.limpieza.count({
      where: { estado: 'TERMINADA', terminadaEn: instantesDelPeriodo(hoyTexto, hoyTexto) },
    }),
  ]);

  const tareas = abiertas.map((limpieza) => ({
    id: limpieza.id,
    estado: limpieza.estado,
    creadaEn: limpieza.creadaEn,
    iniciadaEn: limpieza.iniciadaEn,
    habitacion: limpieza.habitacion.numero,
    nombreHabitacion: limpieza.habitacion.nombre,
    responsable: limpieza.responsable?.nombre ?? null,
  }));

  return {
    pendientes: tareas.filter((tarea) => tarea.estado === 'PENDIENTE'),
    enProceso: tareas.filter((tarea) => tarea.estado === 'EN_PROCESO'),
    terminadasHoy,
  };
}

function productosConStockBajo() {
  return prisma.producto.findMany({
    where: { activo: true, stockActual: { lte: prisma.producto.fields.stockMinimo } },
    select: { id: true, nombre: true, stockActual: true, stockMinimo: true },
    orderBy: { stockActual: 'asc' },
    take: 8,
  });
}

async function ingresosDeLaSemana(hoyTexto) {
  const desde = new Date(Date.parse(hoyTexto) - 6 * DIA_MS).toISOString().slice(0, 10);
  const { totales, porDia } = await reportesService.ingresos({ desde, hasta: hoyTexto });
  return { total: totales.total, hoy: porDia.at(-1).total, porDia };
}

/** Lo que cada rol necesita ver al entrar: el administrador ve el negocio completo. */
export async function obtener(rol) {
  const hoy = hoyEnColombia();
  const hoyTexto = aTextoFecha(hoy);

  if (rol === 'HOUSEKEEPING') {
    return { rol, fecha: hoyTexto, limpiezas: await limpiezas(hoyTexto) };
  }

  const [habitaciones, llegadas, salidas, caja] = await Promise.all([
    estadoHabitaciones(),
    llegadasDeHoy(hoy),
    salidasDeHoy(hoy),
    estadoCaja(),
  ]);
  const base = { rol, fecha: hoyTexto, habitaciones, llegadas, salidas, caja };

  if (rol === 'RECEPCIONISTA') return base;

  const [ingresos, stockBajo, aseo] = await Promise.all([
    ingresosDeLaSemana(hoyTexto),
    productosConStockBajo(),
    limpiezas(hoyTexto),
  ]);
  return { ...base, ingresos, stockBajo, limpiezas: aseo };
}

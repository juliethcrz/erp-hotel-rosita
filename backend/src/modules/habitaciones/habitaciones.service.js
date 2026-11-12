import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { hoyEnColombia } from '../../shared/utils/fechas.js';

export const ESTADOS_RESERVA_ACTIVOS = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'];

const TRANSICIONES_PERMITIDAS = {
  ADMIN: () => true,
  RECEPCIONISTA: (actual, nuevo) =>
    ['DISPONIBLE', 'EN_LIMPIEZA'].includes(actual) && ['DISPONIBLE', 'EN_LIMPIEZA'].includes(nuevo),
  HOUSEKEEPING: (actual, nuevo) => actual === 'EN_LIMPIEZA' && nuevo === 'DISPONIBLE',
};

export async function listar() {
  const hoy = hoyEnColombia();

  const habitaciones = await prisma.habitacion.findMany({
    where: { activa: true },
    orderBy: { numero: 'asc' },
    include: {
      tipo: true,
      reservas: {
        where: {
          reserva: {
            estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
            fechaLlegada: { lte: hoy },
            fechaSalida: { gt: hoy },
          },
        },
        select: { reserva: { select: { id: true, codigo: true } } },
      },
    },
  });

  return habitaciones.map(({ reservas, ...habitacion }) => {
    const reservaHoy = reservas[0]?.reserva ?? null;
    const estadoRack =
      habitacion.estado === 'DISPONIBLE' && reservaHoy ? 'RESERVADA' : habitacion.estado;
    return { ...habitacion, estadoRack, reservaHoy };
  });
}

export function disponibles({ llegada, salida }) {
  return prisma.habitacion.findMany({
    where: {
      activa: true,
      estado: { not: 'EN_MANTENIMIENTO' },
      reservas: {
        none: {
          reserva: {
            estado: { in: ESTADOS_RESERVA_ACTIVOS },
            fechaLlegada: { lt: salida },
            fechaSalida: { gt: llegada },
          },
        },
      },
    },
    include: { tipo: true },
    orderBy: { numero: 'asc' },
  });
}

export function crear(datos) {
  return prisma.habitacion.create({ data: datos, include: { tipo: true } });
}

export function actualizar(id, datos) {
  return prisma.habitacion.update({ where: { id }, data: datos, include: { tipo: true } });
}

export async function cambiarEstado(id, nuevoEstado, rol) {
  const habitacion = await prisma.habitacion.findUnique({ where: { id } });

  if (!habitacion) {
    throw new AppError('La habitación no existe', 404);
  }
  if (habitacion.estado === nuevoEstado) {
    throw new AppError('La habitación ya tiene ese estado');
  }
  if (habitacion.estado === 'OCUPADA' || nuevoEstado === 'OCUPADA') {
    throw new AppError('El estado Ocupada solo cambia con el check-in y el check-out');
  }
  if (!TRANSICIONES_PERMITIDAS[rol](habitacion.estado, nuevoEstado)) {
    throw new AppError('Su rol no permite este cambio de estado', 403);
  }

  return prisma.habitacion.update({
    where: { id },
    data: { estado: nuevoEstado },
    include: { tipo: true },
  });
}

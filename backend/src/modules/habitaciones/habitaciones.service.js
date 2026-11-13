import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { hoyEnColombia } from '../../shared/utils/fechas.js';
import { conUrl } from './fotos.service.js';

export const ESTADOS_RESERVA_ACTIVOS = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'];

// Datos de la ficha que acompañan a cada habitación en el rack y en las reservas.
const FICHA = {
  tipo: true,
  camas: { orderBy: { tipo: 'asc' } },
  caracteristicas: {
    select: { caracteristica: true },
    orderBy: { caracteristica: { nombre: 'asc' } },
  },
  fotos: { orderBy: { orden: 'asc' } },
};

/** Aplana las relaciones de la ficha para que el cliente las reciba listas para mostrar. */
function conFicha({ caracteristicas, fotos, ...habitacion }) {
  const fotosConUrl = fotos.map(conUrl);
  const principal = fotosConUrl.find((foto) => foto.esPrincipal) ?? fotosConUrl[0];
  return {
    ...habitacion,
    caracteristicas: caracteristicas.map(({ caracteristica }) => caracteristica),
    fotos: fotosConUrl,
    fotoPrincipal: principal?.url ?? null,
  };
}

// Los cambios de limpieza los hacen el check-out y housekeeping; a mano solo
// queda el mantenimiento, que lo maneja el administrador.
const TRANSICIONES_MANUALES = {
  ADMIN: (actual, nuevo) =>
    (actual === 'DISPONIBLE' && nuevo === 'EN_MANTENIMIENTO') ||
    (actual === 'EN_MANTENIMIENTO' && nuevo === 'DISPONIBLE') ||
    (actual === 'EN_LIMPIEZA' && nuevo === 'DISPONIBLE'),
  RECEPCIONISTA: () => false,
  HOUSEKEEPING: () => false,
};

export async function listar() {
  const hoy = hoyEnColombia();

  const habitaciones = await prisma.habitacion.findMany({
    where: { activa: true },
    orderBy: { numero: 'asc' },
    include: {
      ...FICHA,
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
    return { ...conFicha(habitacion), estadoRack, reservaHoy };
  });
}

export async function disponibles({ llegada, salida }) {
  const habitaciones = await prisma.habitacion.findMany({
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
    include: FICHA,
    orderBy: { numero: 'asc' },
  });
  return habitaciones.map(conFicha);
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
  if (!TRANSICIONES_MANUALES[rol](habitacion.estado, nuevoEstado)) {
    throw new AppError('Su rol no permite este cambio de estado', 403);
  }

  return prisma.$transaction(async (tx) => {
    if (habitacion.estado === 'EN_LIMPIEZA') {
      await tx.limpieza.updateMany({
        where: { habitacionId: id, estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
        data: { estado: 'TERMINADA', terminadaEn: new Date() },
      });
    }

    return tx.habitacion.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: { tipo: true },
    });
  });
}

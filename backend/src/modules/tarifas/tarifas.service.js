import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function listarTipos() {
  return prisma.tipoHabitacion.findMany({
    orderBy: { capacidadMaxima: 'asc' },
    include: { _count: { select: { habitaciones: true } } },
  });
}

export function actualizarTipo(id, datos) {
  return prisma.tipoHabitacion.update({ where: { id }, data: datos });
}

export function listarTemporadas() {
  return prisma.temporada.findMany({
    orderBy: { fechaInicio: 'asc' },
    include: { tarifas: { include: { tipoHabitacion: { select: { nombre: true } } } } },
  });
}

async function validarSinCruce({ fechaInicio, fechaFin }, idExcluido) {
  const cruce = await prisma.temporada.findFirst({
    where: {
      activa: true,
      id: idExcluido ? { not: idExcluido } : undefined,
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
  });

  if (cruce) {
    throw new AppError(`Las fechas se cruzan con la temporada "${cruce.nombre}"`, 409);
  }
}

export async function crearTemporada({ tarifas, ...datos }) {
  await validarSinCruce(datos);

  return prisma.temporada.create({
    data: { ...datos, tarifas: { create: tarifas } },
    include: { tarifas: true },
  });
}

export async function actualizarTemporada(id, { tarifas, ...datos }) {
  const actual = await prisma.temporada.findUnique({ where: { id } });
  if (!actual) {
    throw new AppError('La temporada no existe', 404);
  }

  const resultado = { ...actual, ...datos };
  if (resultado.fechaFin < resultado.fechaInicio) {
    throw new AppError('La fecha final no puede ser anterior a la inicial');
  }
  if (resultado.activa) {
    await validarSinCruce(resultado, id);
  }

  return prisma.$transaction(async (tx) => {
    if (tarifas) {
      await tx.tarifaTemporada.deleteMany({ where: { temporadaId: id } });
      await tx.tarifaTemporada.createMany({
        data: tarifas.map((tarifa) => ({ ...tarifa, temporadaId: id })),
      });
    }
    return tx.temporada.update({ where: { id }, data: datos, include: { tarifas: true } });
  });
}

export function eliminarTemporada(id) {
  return prisma.temporada.delete({ where: { id } });
}

/**
 * Calcula la tarifa de cada noche de una estadía. Una noche se cobra con la
 * tarifa de temporada si su fecha cae dentro de una temporada activa
 * (fechas inclusivas); si no, con la tarifa base del tipo de habitación.
 */
export async function calcularEstadia(tipoId, llegada, salida) {
  const tipo = await prisma.tipoHabitacion.findUnique({ where: { id: tipoId } });
  if (!tipo) {
    throw new AppError('El tipo de habitación no existe', 404);
  }

  const temporadas = await prisma.temporada.findMany({
    where: { activa: true, fechaInicio: { lt: salida }, fechaFin: { gte: llegada } },
    include: { tarifas: { where: { tipoHabitacionId: tipoId } } },
  });

  const noches = [];
  for (let fecha = llegada; fecha < salida; fecha = new Date(fecha.getTime() + MS_POR_DIA)) {
    const temporada = temporadas.find(
      (candidata) =>
        candidata.fechaInicio <= fecha && fecha <= candidata.fechaFin && candidata.tarifas.length,
    );
    noches.push({
      fecha,
      tarifa: temporada ? temporada.tarifas[0].tarifa : tipo.tarifaBase,
      temporada: temporada?.nombre ?? null,
    });
  }

  const total = noches.reduce((suma, noche) => suma + noche.tarifa, 0);
  return { tipo: tipo.nombre, noches, total };
}

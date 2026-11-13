import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import { hoyEnColombia, momentoEnColombia } from '../../shared/utils/fechas.js';
import { notificar } from '../notificaciones/notificaciones.service.js';

const incluir = {
  habitacion: { select: { id: true, numero: true, tipo: { select: { nombre: true } } } },
  responsable: { select: { nombre: true, apellido: true } },
};

export function listar() {
  const inicioDelDia = momentoEnColombia(hoyEnColombia(), '00:00');

  return prisma.limpieza.findMany({
    where: {
      OR: [
        { estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
        { estado: 'TERMINADA', terminadaEn: { gte: inicioDelDia } },
      ],
    },
    orderBy: { creadaEn: 'asc' },
    include: incluir,
  });
}

async function buscar(tx, id, estadoEsperado, mensaje) {
  const limpieza = await tx.limpieza.findUnique({ where: { id }, include: incluir });
  if (!limpieza) {
    throw new AppError('La tarea de limpieza no existe', 404);
  }
  if (limpieza.estado !== estadoEsperado) {
    throw new AppError(mensaje, 409);
  }
  return limpieza;
}

export function iniciar(id, usuario) {
  return prisma.$transaction(async (tx) => {
    const limpieza = await buscar(tx, id, 'PENDIENTE', 'Esta limpieza ya fue iniciada');
    const responsable = await tx.usuario.findUnique({ where: { id: usuario.id } });

    const actualizada = await tx.limpieza.update({
      where: { id },
      data: { estado: 'EN_PROCESO', responsableId: usuario.id, iniciadaEn: new Date() },
      include: incluir,
    });

    await notificar(tx, ['RECEPCIONISTA', 'ADMIN'], {
      titulo: `Limpieza iniciada · Habitación ${limpieza.habitacion.numero}`,
      mensaje: `${responsable.nombre} comenzó a limpiar la habitación ${limpieza.habitacion.numero}.`,
      habitacionId: limpieza.habitacionId,
    });

    return actualizada;
  });
}

export function terminar(id, { observaciones }, usuario) {
  return prisma.$transaction(async (tx) => {
    const limpieza = await buscar(
      tx,
      id,
      'EN_PROCESO',
      'Primero debe iniciar la limpieza antes de marcarla como lista',
    );
    const responsable = await tx.usuario.findUnique({ where: { id: usuario.id } });
    const numero = limpieza.habitacion.numero;

    const actualizada = await tx.limpieza.update({
      where: { id },
      data: { estado: 'TERMINADA', terminadaEn: new Date(), observaciones: observaciones || null },
      include: incluir,
    });

    await tx.habitacion.update({
      where: { id: limpieza.habitacionId },
      data: { estado: 'DISPONIBLE' },
    });

    await notificar(tx, ['RECEPCIONISTA', 'ADMIN'], {
      titulo: `Habitación ${numero} lista`,
      mensaje: `${responsable.nombre} terminó la limpieza. La habitación ${numero} ya se puede asignar.`,
      habitacionId: limpieza.habitacionId,
    });

    if (observaciones) {
      await notificar(tx, ['ADMIN'], {
        titulo: `Observación en la habitación ${numero}`,
        mensaje: observaciones,
        habitacionId: limpieza.habitacionId,
      });
    }

    return actualizada;
  });
}

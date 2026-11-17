import { prisma } from '../../config/database.js';

const LIMITE = 30;

export function notificar(tx, roles, { titulo, mensaje, habitacionId = null }) {
  return tx.notificacion.createMany({
    data: roles.map((rolDestino) => ({ rolDestino, titulo, mensaje, habitacionId })),
  });
}

export async function listar(rol) {
  const [notificaciones, noLeidas] = await Promise.all([
    prisma.notificacion.findMany({
      where: { rolDestino: rol },
      orderBy: { creadaEn: 'desc' },
      take: LIMITE,
    }),
    prisma.notificacion.count({ where: { rolDestino: rol, leida: false } }),
  ]);

  return { notificaciones, noLeidas };
}

export function marcarLeida(id, usuario) {
  return prisma.notificacion.updateMany({
    where: { id, rolDestino: usuario.rol, leida: false },
    data: { leida: true, leidaPorId: usuario.id, leidaEn: new Date() },
  });
}

export function marcarTodasLeidas(usuario) {
  return prisma.notificacion.updateMany({
    where: { rolDestino: usuario.rol, leida: false },
    data: { leida: true, leidaPorId: usuario.id, leidaEn: new Date() },
  });
}

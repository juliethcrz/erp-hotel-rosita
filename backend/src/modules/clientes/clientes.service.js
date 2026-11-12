import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';

const LIMITE_RESULTADOS = 50;

export function buscar({ buscar }) {
  const where = buscar
    ? {
        OR: [
          { nombres: { contains: buscar, mode: 'insensitive' } },
          { apellidos: { contains: buscar, mode: 'insensitive' } },
          { numeroDocumento: { contains: buscar } },
        ],
      }
    : {};

  return prisma.cliente.findMany({
    where,
    orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    take: LIMITE_RESULTADOS,
  });
}

export async function obtener(id) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      reservasComoTitular: {
        orderBy: { fechaLlegada: 'desc' },
        select: { id: true, codigo: true, fechaLlegada: true, fechaSalida: true, estado: true },
      },
    },
  });

  if (!cliente) {
    throw new AppError('El cliente no existe', 404);
  }

  return cliente;
}

export function crear(datos) {
  return prisma.cliente.create({ data: datos });
}

export function actualizar(id, datos) {
  return prisma.cliente.update({ where: { id }, data: datos });
}

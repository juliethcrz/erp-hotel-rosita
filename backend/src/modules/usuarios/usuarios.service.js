import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';

const camposPublicos = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  activo: true,
  creadoEn: true,
};

export function listar() {
  return prisma.usuario.findMany({ select: camposPublicos, orderBy: { nombre: 'asc' } });
}

export async function crear({ password, ...datos }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.usuario.create({ data: { ...datos, passwordHash }, select: camposPublicos });
}

export async function actualizar(id, datos, usuarioActualId) {
  if (id === usuarioActualId && (datos.activo === false || (datos.rol && datos.rol !== 'ADMIN'))) {
    throw new AppError('No puede desactivarse ni quitarse el rol de administrador a sí mismo');
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: datos,
    select: camposPublicos,
  });

  if (datos.activo === false) {
    await revocarSesiones(id);
  }

  return usuario;
}

export async function restablecerPassword(id, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.update({ where: { id }, data: { passwordHash } });
  await revocarSesiones(id);
}

function revocarSesiones(usuarioId) {
  return prisma.refreshToken.updateMany({
    where: { usuarioId, revocadoEn: null },
    data: { revocadoEn: new Date() },
  });
}

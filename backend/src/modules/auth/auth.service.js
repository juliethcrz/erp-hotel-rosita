import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';

const MS_POR_HORA = 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function datosPublicos(usuario) {
  const { id, nombre, apellido, email, rol } = usuario;
  return { id, nombre, apellido, email, rol };
}

function firmarAccessToken(usuario) {
  return jwt.sign({ rol: usuario.rol }, env.jwt.accessSecret, {
    subject: String(usuario.id),
    expiresIn: env.jwt.accessExpiresIn,
  });
}

async function emitirRefreshToken(usuarioId) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiraEn = new Date(Date.now() + env.refreshTokenTtlHours * MS_POR_HORA);

  await prisma.refreshToken.create({
    data: { usuarioId, tokenHash: hashToken(token), expiraEn },
  });

  return { token, expiraEn };
}

async function crearSesion(usuario) {
  return {
    usuario: datosPublicos(usuario),
    accessToken: firmarAccessToken(usuario),
    refresh: await emitirRefreshToken(usuario.id),
  };
}

export async function iniciarSesion({ email, password }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const credencialesValidas =
    usuario?.activo && (await bcrypt.compare(password, usuario.passwordHash));

  if (!credencialesValidas) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  return crearSesion(usuario);
}

export async function renovarSesion(token) {
  const sesionExpirada = new AppError('La sesión expiró, inicie sesión de nuevo', 401);
  if (!token) throw sesionExpirada;

  const registro = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: true },
  });

  if (!registro) throw sesionExpirada;

  if (registro.revocadoEn) {
    // Un token ya usado que vuelve a aparecer indica que pudo ser robado:
    // se cierran todas las sesiones del usuario.
    await prisma.refreshToken.updateMany({
      where: { usuarioId: registro.usuarioId, revocadoEn: null },
      data: { revocadoEn: new Date() },
    });
    throw sesionExpirada;
  }

  if (registro.expiraEn < new Date() || !registro.usuario.activo) {
    throw sesionExpirada;
  }

  await prisma.refreshToken.update({
    where: { id: registro.id },
    data: { revocadoEn: new Date() },
  });

  return crearSesion(registro.usuario);
}

export async function cerrarSesion(token) {
  if (!token) return;

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revocadoEn: null },
    data: { revocadoEn: new Date() },
  });
}

export async function obtenerPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

  if (!usuario?.activo) {
    throw new AppError('Debe iniciar sesión', 401);
  }

  return datosPublicos(usuario);
}

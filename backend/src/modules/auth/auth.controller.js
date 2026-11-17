import { env } from '../../config/env.js';
import * as authService from './auth.service.js';

const COOKIE_REFRESH = 'refresh_token';

function opcionesCookie() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/api/auth',
  };
}

function responderSesion(res, { usuario, accessToken, refresh }) {
  res.cookie(COOKIE_REFRESH, refresh.token, { ...opcionesCookie(), expires: refresh.expiraEn });
  res.json({ usuario, accessToken });
}

export async function login(req, res) {
  const sesion = await authService.iniciarSesion(req.validated.body);
  responderSesion(res, sesion);
}

export async function refresh(req, res) {
  const sesion = await authService.renovarSesion(req.cookies[COOKIE_REFRESH]);
  responderSesion(res, sesion);
}

export async function logout(req, res) {
  await authService.cerrarSesion(req.cookies[COOKIE_REFRESH]);
  res.clearCookie(COOKIE_REFRESH, opcionesCookie());
  res.status(204).end();
}

export async function perfil(req, res) {
  res.json(await authService.obtenerPerfil(req.user.id));
}

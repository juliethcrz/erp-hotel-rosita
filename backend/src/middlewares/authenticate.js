import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../shared/errors/AppError.js';

export function authenticate(req, _res, next) {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');

  if (esquema !== 'Bearer' || !token) {
    throw new AppError('Debe iniciar sesión', 401);
  }

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = { id: Number(payload.sub), rol: payload.rol };
  } catch {
    throw new AppError('La sesión expiró o no es válida', 401);
  }

  next();
}

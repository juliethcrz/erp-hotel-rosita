import { AppError } from '../shared/errors/AppError.js';

export function authorize(...rolesPermitidos) {
  return (req, _res, next) => {
    if (!rolesPermitidos.includes(req.user?.rol)) {
      throw new AppError('No tiene permiso para realizar esta acción', 403);
    }
    next();
  };
}

import { AppError } from '../shared/errors/AppError.js';

const PARTES = ['body', 'params', 'query'];

export function validate(esquemas) {
  return (req, _res, next) => {
    req.validated = {};

    for (const parte of PARTES) {
      if (!esquemas[parte]) continue;

      const resultado = esquemas[parte].safeParse(req[parte] ?? {});
      if (!resultado.success) {
        const details = resultado.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        }));
        throw new AppError('Datos inválidos', 400, details);
      }
      req.validated[parte] = resultado.data;
    }

    next();
  };
}

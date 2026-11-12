const ERRORES_PRISMA = {
  P2002: { statusCode: 409, message: 'Ya existe un registro con esos datos' },
  P2003: { statusCode: 409, message: 'El registro está relacionado con otros datos' },
  P2025: { statusCode: 404, message: 'El registro no existe' },
};

export function errorHandler(err, req, res, _next) {
  const errorPrisma = ERRORES_PRISMA[err.code];
  const statusCode = errorPrisma?.statusCode ?? err.statusCode ?? 500;

  if (statusCode === 500) {
    console.error(err);
  }

  const message =
    statusCode === 500 ? 'Error interno del servidor' : (errorPrisma?.message ?? err.message);

  res.status(statusCode).json({
    error: { message, ...(err.details && { details: err.details }) },
  });
}

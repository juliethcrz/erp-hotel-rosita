const ERRORES_PRISMA = {
  P2002: { statusCode: 409, message: 'Ya existe un registro con esos datos' },
  P2003: { statusCode: 409, message: 'El registro está relacionado con otros datos' },
  P2025: { statusCode: 404, message: 'El registro no existe' },
};

const ERRORES_ARCHIVO = {
  LIMIT_FILE_SIZE: 'Cada foto puede pesar máximo 5 MB',
  LIMIT_FILE_COUNT: 'Se pueden subir máximo 10 fotos a la vez',
  LIMIT_UNEXPECTED_FILE: 'Se pueden subir máximo 10 fotos a la vez',
};

export function errorHandler(err, req, res, _next) {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: { message: ERRORES_ARCHIVO[err.code] ?? 'No se pudo recibir el archivo' },
    });
  }

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

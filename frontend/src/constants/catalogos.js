export const ROLES = {
  ADMIN: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  HOUSEKEEPING: 'Housekeeping',
};

export const TIPOS_DOCUMENTO = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PASAPORTE: 'Pasaporte',
};

export const ESTADOS_HABITACION = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  OCUPADA: 'Ocupada',
  EN_LIMPIEZA: 'En limpieza',
  EN_MANTENIMIENTO: 'En mantenimiento',
};

const ESTADOS_MANUALES = ['DISPONIBLE', 'EN_LIMPIEZA', 'EN_MANTENIMIENTO'];

export function estadosPermitidos(rol, estadoActual) {
  if (estadoActual === 'OCUPADA') return [];

  const opciones = {
    ADMIN: ESTADOS_MANUALES,
    RECEPCIONISTA: ['DISPONIBLE', 'EN_LIMPIEZA'].includes(estadoActual)
      ? ['DISPONIBLE', 'EN_LIMPIEZA']
      : [],
    HOUSEKEEPING: estadoActual === 'EN_LIMPIEZA' ? ['DISPONIBLE'] : [],
  };

  return opciones[rol].filter((estado) => estado !== estadoActual);
}

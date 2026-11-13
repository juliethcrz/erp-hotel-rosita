export const TONO_ESTADO = {
  DISPONIBLE: 'exito',
  RESERVADA: 'info',
  OCUPADA: 'peligro',
  EN_LIMPIEZA: 'aviso',
  EN_MANTENIMIENTO: 'neutro',
};

// La limpieza la mueven el check-out y housekeeping; a mano solo queda el
// mantenimiento, a cargo del administrador.
const TRANSICIONES_ADMIN = {
  DISPONIBLE: ['EN_MANTENIMIENTO'],
  EN_MANTENIMIENTO: ['DISPONIBLE'],
  EN_LIMPIEZA: ['DISPONIBLE'],
};

export function estadosPermitidos(rol, estadoActual) {
  return rol === 'ADMIN' ? (TRANSICIONES_ADMIN[estadoActual] ?? []) : [];
}

export function agruparPorPiso(habitaciones) {
  return habitaciones.reduce((pisos, habitacion) => {
    (pisos[habitacion.piso] ??= []).push(habitacion);
    return pisos;
  }, {});
}

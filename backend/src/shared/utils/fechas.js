const ZONA_HORARIA = 'America/Bogota';
const DESFASE_COLOMBIA = '-05:00';

export function hoyEnColombia() {
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date());
  return new Date(`${fecha}T00:00:00Z`);
}

export function aTextoFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

export function momentoEnColombia(fecha, hora) {
  return new Date(`${aTextoFecha(fecha)}T${hora}:00${DESFASE_COLOMBIA}`);
}

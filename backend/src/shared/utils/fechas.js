const ZONA_HORARIA = 'America/Bogota';

export function hoyEnColombia() {
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date());
  return new Date(`${fecha}T00:00:00Z`);
}

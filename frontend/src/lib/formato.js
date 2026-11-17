// El hotel opera en Colombia: las horas se muestran en su zona horaria aunque
// el equipo o el servidor estén configurados en otra.
const ZONA_HORARIA = 'America/Bogota';

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const fechaCorta = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const fechaHora = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: ZONA_HORARIA,
});

const diaEnColombia = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA });
const horaEnColombia = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: ZONA_HORARIA,
});

export function formatearPesos(valor) {
  return pesos.format(valor ?? 0);
}

export function formatearFecha(valor) {
  return valor ? fechaCorta.format(new Date(valor)) : '—';
}

export function formatearFechaHora(valor) {
  return valor ? fechaHora.format(new Date(valor)) : '—';
}

/** Fecha de hoy en Colombia, en formato AAAA-MM-DD. */
export function hoyLocal() {
  return diaEnColombia.format(new Date());
}

/** Suma días a una fecha AAAA-MM-DD sin depender de la zona horaria del equipo. */
export function sumarDias(fecha, dias) {
  const resultado = new Date(`${fecha}T12:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

export function saludoSegunHora() {
  const hora = Number(horaEnColombia.format(new Date()));
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Recibe el valor ya en porcentaje (57.5 → "57,5 %"). */
export function formatearPorcentaje(valor) {
  return `${(valor ?? 0).toLocaleString('es-CO')} %`;
}

export function comprobante(id) {
  return `N.º ${String(id).padStart(5, '0')}`;
}

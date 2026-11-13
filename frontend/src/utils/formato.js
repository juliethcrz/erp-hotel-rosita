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

export function hoyLocal() {
  return new Date().toLocaleDateString('en-CA');
}

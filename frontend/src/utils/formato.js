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

export function formatearPesos(valor) {
  return pesos.format(valor ?? 0);
}

export function formatearFecha(valor) {
  return valor ? fechaCorta.format(new Date(valor)) : '—';
}

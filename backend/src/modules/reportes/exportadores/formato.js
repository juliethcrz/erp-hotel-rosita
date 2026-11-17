const ZONA_HORARIA = 'America/Bogota';

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
const numero = new Intl.NumberFormat('es-CO');
const porcentaje = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  maximumFractionDigits: 1,
});
const fecha = new Intl.DateTimeFormat('es-CO', {
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

const esFechaTexto = (valor) => typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);

/** Texto para mostrar un valor en el PDF según el formato de su columna. */
export function aTexto(valor, tipo) {
  if (valor === null || valor === undefined) return '';
  switch (tipo) {
    case 'pesos':
      return pesos.format(valor);
    case 'numero':
      return numero.format(valor);
    case 'porcentaje':
      return porcentaje.format(valor);
    case 'fecha':
      return esFechaTexto(valor) ? fecha.format(new Date(`${valor}T00:00:00Z`)) : String(valor);
    case 'fechaHora':
      return valor instanceof Date ? fechaHora.format(valor) : String(valor);
    default:
      return String(valor);
  }
}

export function textoPeriodo({ desde, hasta }) {
  const inicio = aTexto(desde, 'fecha');
  return desde === hasta ? inicio : `${inicio} al ${aTexto(hasta, 'fecha')}`;
}

export const esNumerico = (tipo) => ['pesos', 'numero', 'porcentaje'].includes(tipo);

/** Excel no maneja zonas horarias: se guarda la hora de Colombia como si fuera UTC. */
export function fechaParaExcel(valor, tipo) {
  if (tipo === 'fecha' && esFechaTexto(valor)) return new Date(`${valor}T00:00:00Z`);
  if (tipo === 'fechaHora' && valor instanceof Date) {
    return new Date(valor.getTime() - 5 * 60 * 60 * 1000);
  }
  return valor;
}

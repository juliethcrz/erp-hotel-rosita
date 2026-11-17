import { hoyLocal, sumarDias } from '../../../lib/formato.js';

function inicioDeMes(fecha) {
  return `${fecha.slice(0, 7)}-01`;
}

/** Atajos de periodo, calculados con la fecha de hoy en Colombia. */
export const PERIODOS_RAPIDOS = [
  { clave: 'hoy', etiqueta: 'Hoy', calcular: () => ({ desde: hoyLocal(), hasta: hoyLocal() }) },
  {
    clave: 'semana',
    etiqueta: 'Últimos 7 días',
    calcular: () => ({ desde: sumarDias(hoyLocal(), -6), hasta: hoyLocal() }),
  },
  {
    clave: 'mes',
    etiqueta: 'Este mes',
    calcular: () => ({ desde: inicioDeMes(hoyLocal()), hasta: hoyLocal() }),
  },
  {
    clave: 'mesAnterior',
    etiqueta: 'Mes anterior',
    calcular: () => {
      const finMesAnterior = sumarDias(inicioDeMes(hoyLocal()), -1);
      return { desde: inicioDeMes(finMesAnterior), hasta: finMesAnterior };
    },
  },
];

/** Descarga un archivo recibido de la API con el nombre indicado. */
export function guardarArchivo(contenido, nombre) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

import { hoyLocal } from '../../../lib/formato.js';

const aTexto = (fecha) => fecha.toLocaleDateString('en-CA');

function desplazar(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return aTexto(fecha);
}

/** Atajos de periodo, calculados con la fecha local del equipo. */
export const PERIODOS_RAPIDOS = [
  { clave: 'hoy', etiqueta: 'Hoy', calcular: () => ({ desde: hoyLocal(), hasta: hoyLocal() }) },
  {
    clave: 'semana',
    etiqueta: 'Últimos 7 días',
    calcular: () => ({ desde: desplazar(-6), hasta: hoyLocal() }),
  },
  {
    clave: 'mes',
    etiqueta: 'Este mes',
    calcular: () => {
      const hoy = new Date();
      return { desde: aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: hoyLocal() };
    },
  },
  {
    clave: 'mesAnterior',
    etiqueta: 'Mes anterior',
    calcular: () => {
      const hoy = new Date();
      return {
        desde: aTexto(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
        hasta: aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 0)),
      };
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

export const NOMBRES_METODO = {
  EFECTIVO: 'Efectivo',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  BANCOLOMBIA: 'Bancolombia',
  TRANSFERENCIA: 'Transferencia',
};

export const porcentaje = (valor) => `${valor.toLocaleString('es-CO')} %`;

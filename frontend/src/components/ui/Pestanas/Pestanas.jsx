import { cx } from '../../../lib/clases.js';
import estilos from './Pestanas.module.css';

/** Selector de opciones excluyentes con aspecto de interruptor segmentado. */
export function Pestanas({ opciones, valor, onCambiar, ancho = false, etiqueta }) {
  return (
    <div
      className={cx(estilos.pestanas, ancho && estilos.ancho)}
      role="tablist"
      aria-label={etiqueta}
    >
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          role="tab"
          aria-selected={valor === opcion.valor}
          className={cx(estilos.opcion, valor === opcion.valor && estilos.activa)}
          onClick={() => onCambiar(opcion.valor)}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}

import { ESTADOS_HABITACION } from '../../../../constants/catalogos.js';
import { cx } from '../../../../lib/clases.js';
import estilos from './LeyendaEstados.module.css';

/** Chips de estado que también sirven como filtro del rack. */
export function LeyendaEstados({ conteo, filtro, onFiltrar }) {
  return (
    <div className={estilos.leyenda} role="group" aria-label="Filtrar por estado">
      <button
        type="button"
        className={cx(estilos.chip, !filtro && estilos.activo)}
        onClick={() => onFiltrar(null)}
      >
        Todas
      </button>
      {Object.entries(ESTADOS_HABITACION).map(([estado, etiqueta]) => (
        <button
          key={estado}
          type="button"
          className={cx(estilos.chip, filtro === estado && estilos.activo)}
          onClick={() => onFiltrar(filtro === estado ? null : estado)}
        >
          <span className={cx(estilos.punto, estilos[estado])} aria-hidden="true" />
          {etiqueta}
          <span className={estilos.cantidad}>{conteo[estado] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

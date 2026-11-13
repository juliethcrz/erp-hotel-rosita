import { cx } from '../../../../lib/clases.js';
import { PERIODOS_RAPIDOS } from '../../utils/periodos.js';
import estilos from './FiltroPeriodo.module.css';

export function FiltroPeriodo({ periodo, onCambiar }) {
  const activo = PERIODOS_RAPIDOS.find((opcion) => {
    const calculado = opcion.calcular();
    return calculado.desde === periodo.desde && calculado.hasta === periodo.hasta;
  })?.clave;

  return (
    <div className={estilos.filtro}>
      <div className={estilos.atajos} role="group" aria-label="Periodos rápidos">
        {PERIODOS_RAPIDOS.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            className={cx(estilos.atajo, activo === opcion.clave && estilos.activo)}
            onClick={() => onCambiar(opcion.calcular())}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
      <div className={estilos.fechas}>
        <label>
          <span>Desde</span>
          <input
            type="date"
            value={periodo.desde}
            max={periodo.hasta}
            onChange={(e) => onCambiar({ ...periodo, desde: e.target.value })}
          />
        </label>
        <label>
          <span>Hasta</span>
          <input
            type="date"
            value={periodo.hasta}
            min={periodo.desde}
            onChange={(e) => onCambiar({ ...periodo, hasta: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

import { cx } from '../../../lib/clases.js';
import estilos from './Cifra.module.css';

/** Indicador numérico destacado (KPI). */
export function Cifra({ etiqueta, valor, detalle, icono: Icono, destacada = false }) {
  return (
    <div className={cx(estilos.cifra, destacada && estilos.destacada)}>
      <div className={estilos.encabezado}>
        <span>{etiqueta}</span>
        {Icono && (
          <span className={estilos.icono}>
            <Icono size={18} aria-hidden="true" />
          </span>
        )}
      </div>
      <strong>{valor}</strong>
      {detalle && <small>{detalle}</small>}
    </div>
  );
}

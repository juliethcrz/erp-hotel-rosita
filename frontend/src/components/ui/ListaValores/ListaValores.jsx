import { cx } from '../../../lib/clases.js';
import estilos from './ListaValores.module.css';

/** Lista de pares etiqueta–valor, como el resumen de una cuenta. */
export function ListaValores({ filas, className }) {
  return (
    <dl className={cx(estilos.lista, className)}>
      {filas.filter(Boolean).map(({ etiqueta, valor, total }) => (
        <div key={etiqueta} className={cx(estilos.fila, total && estilos.total)}>
          <dt>{etiqueta}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

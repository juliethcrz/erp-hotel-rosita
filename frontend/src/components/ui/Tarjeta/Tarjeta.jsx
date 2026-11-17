import { cx } from '../../../lib/clases.js';
import estilos from './Tarjeta.module.css';

export function Tarjeta({ titulo, acciones, className, children }) {
  return (
    <section className={cx(estilos.tarjeta, className)}>
      {(titulo || acciones) && (
        <header className={estilos.encabezado}>
          {titulo && <h2>{titulo}</h2>}
          {acciones}
        </header>
      )}
      {children}
    </section>
  );
}

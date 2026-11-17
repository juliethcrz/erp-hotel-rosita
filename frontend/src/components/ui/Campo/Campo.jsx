import { cx } from '../../../lib/clases.js';
import estilos from './Campo.module.css';

export function Campo({ etiqueta, ayuda, className, children }) {
  return (
    <label className={cx(estilos.campo, className)}>
      {etiqueta && <span className={estilos.etiqueta}>{etiqueta}</span>}
      {children}
      {ayuda && <small className={estilos.ayuda}>{ayuda}</small>}
    </label>
  );
}

export function FilaCampos({ children }) {
  return <div className={estilos.fila}>{children}</div>;
}

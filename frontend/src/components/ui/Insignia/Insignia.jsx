import { cx } from '../../../lib/clases.js';
import estilos from './Insignia.module.css';

export function Insignia({ tono = 'neutro', punto = false, children }) {
  return (
    <span className={cx(estilos.insignia, estilos[tono])}>
      {punto && <span className={estilos.punto} aria-hidden="true" />}
      {children}
    </span>
  );
}

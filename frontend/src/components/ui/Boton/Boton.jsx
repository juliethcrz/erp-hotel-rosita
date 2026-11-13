import { Link } from 'react-router';
import { cx } from '../../../lib/clases.js';
import estilos from './Boton.module.css';

export function Boton({
  variante = 'secundario',
  tamano = 'md',
  ancho = false,
  icono: Icono,
  to,
  className,
  children,
  type = 'button',
  ...props
}) {
  const clases = cx(
    estilos.boton,
    estilos[variante],
    tamano === 'sm' && estilos.pequeno,
    ancho && estilos.ancho,
    !children && estilos.soloIcono,
    className,
  );
  const contenido = (
    <>
      {Icono && <Icono size={tamano === 'sm' ? 14 : 17} aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type={type} className={clases} {...props}>
      {contenido}
    </button>
  );
}

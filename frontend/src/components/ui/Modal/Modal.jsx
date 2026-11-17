import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cx } from '../../../lib/clases.js';
import estilos from './Modal.module.css';

/**
 * Ventana sobre la pantalla. Con `lateral` se presenta como panel que se
 * desliza desde la derecha (y desde abajo en el celular).
 */
export function Modal({ titulo, onCerrar, lateral = false, ancho = 'md', cabecera, children }) {
  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPresionarTecla);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPresionarTecla);
      document.body.style.overflow = '';
    };
  }, [onCerrar]);

  return (
    <div className={cx(estilos.fondo, lateral && estilos.fondoLateral)} onMouseDown={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cx(estilos.ventana, lateral ? estilos.lateral : estilos[ancho])}
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        {cabecera ?? (
          <header className={estilos.encabezado}>
            <h2>{titulo}</h2>
            <button type="button" className={estilos.cerrar} onClick={onCerrar} aria-label="Cerrar">
              <X size={18} />
            </button>
          </header>
        )}
        <div className={estilos.cuerpo}>{children}</div>
      </div>
    </div>
  );
}

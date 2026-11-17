import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cx } from '../../../lib/clases.js';
import estilos from './Alerta.module.css';

export function Alerta({ tipo = 'error', children }) {
  if (!children) return null;
  const Icono = tipo === 'exito' ? CheckCircle2 : AlertCircle;

  return (
    <div className={cx(estilos.alerta, estilos[tipo])} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function AlertaError({ error }) {
  if (!error) return null;

  return (
    <Alerta tipo="error">
      <p>{error.message}</p>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((detalle) => (
            <li key={detalle.campo}>
              {detalle.campo}: {detalle.mensaje}
            </li>
          ))}
        </ul>
      )}
    </Alerta>
  );
}

import { Check } from 'lucide-react';
import { cx } from '../../../../lib/clases.js';
import estilos from './PasosReserva.module.css';

const PASOS = ['Fechas', 'Habitaciones', 'Titular', 'Confirmación'];

export function PasosReserva({ actual }) {
  return (
    <ol className={estilos.pasos}>
      {PASOS.map((paso, indice) => (
        <li
          key={paso}
          className={cx(
            estilos.paso,
            indice === actual && estilos.actual,
            indice < actual && estilos.hecho,
          )}
          aria-current={indice === actual ? 'step' : undefined}
        >
          <span className={estilos.marca}>
            {indice < actual ? <Check size={14} aria-hidden="true" /> : indice + 1}
          </span>
          <span className={estilos.nombre}>{paso}</span>
        </li>
      ))}
    </ol>
  );
}

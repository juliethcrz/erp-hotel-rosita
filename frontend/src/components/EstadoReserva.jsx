import { ESTADOS_RESERVA } from '../constants/catalogos.js';

export function EstadoReserva({ estado }) {
  return <span className={`etiqueta reserva-${estado}`}>{ESTADOS_RESERVA[estado]}</span>;
}

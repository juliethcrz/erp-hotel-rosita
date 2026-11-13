import { Insignia } from '../../../../components/ui/index.js';
import { ESTADOS_RESERVA } from '../../../../constants/catalogos.js';

const TONO = {
  PENDIENTE: 'aviso',
  CONFIRMADA: 'info',
  EN_CURSO: 'exito',
  FINALIZADA: 'neutro',
  CANCELADA: 'peligro',
  NO_SHOW: 'peligro',
};

export function EstadoReserva({ estado }) {
  return (
    <Insignia tono={TONO[estado]} punto>
      {ESTADOS_RESERVA[estado]}
    </Insignia>
  );
}

import { BedDouble, Users } from 'lucide-react';
import { Insignia } from '../../../../components/ui/index.js';
import { ESTADOS_HABITACION } from '../../../../constants/catalogos.js';
import { cx } from '../../../../lib/clases.js';
import { TONO_ESTADO } from '../../utils/estadosHabitacion.js';
import estilos from './TarjetaHabitacion.module.css';

export function TarjetaHabitacion({ habitacion, seleccionada, onSeleccionar, pie }) {
  const { numero, tipo, estadoRack, fotoPrincipal } = habitacion;

  return (
    <button
      type="button"
      className={cx(estilos.tarjeta, seleccionada && estilos.seleccionada)}
      onClick={() => onSeleccionar(habitacion)}
    >
      <div className={cx(estilos.foto, estilos[`tipo${tipo.id % 4}`])}>
        {fotoPrincipal ? (
          <img src={fotoPrincipal} alt={`Habitación ${numero}`} loading="lazy" />
        ) : (
          <BedDouble size={34} strokeWidth={1.4} aria-hidden="true" />
        )}
        <span className={estilos.numero}>{numero}</span>
        {estadoRack && (
          <span className={estilos.estado}>
            <Insignia tono={TONO_ESTADO[estadoRack]} punto>
              {ESTADOS_HABITACION[estadoRack]}
            </Insignia>
          </span>
        )}
      </div>
      <div className={estilos.datos}>
        <strong>{tipo.nombre}</strong>
        <span>
          <Users size={14} aria-hidden="true" /> {tipo.capacidadMaxima}
        </span>
      </div>
      {pie && <div className={estilos.pie}>{pie}</div>}
    </button>
  );
}

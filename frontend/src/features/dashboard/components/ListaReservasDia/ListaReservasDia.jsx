import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Tarjeta } from '../../../../components/ui/index.js';
import { formatearFecha } from '../../../../lib/formato.js';
import estilos from './ListaReservasDia.module.css';

/** Llegadas o salidas del día, con acceso directo a cada reserva. */
export function ListaReservasDia({ titulo, reservas, vacio, hoy, tipo }) {
  return (
    <Tarjeta
      titulo={
        <>
          {titulo} <span className={estilos.contador}>{reservas.length}</span>
        </>
      }
    >
      {reservas.length === 0 ? (
        <p className={estilos.vacio}>{vacio}</p>
      ) : (
        <ul className={estilos.lista}>
          {reservas.map((reserva) => {
            const atrasada = tipo === 'salida' && reserva.fechaSalida.slice(0, 10) < hoy;
            return (
              <li key={reserva.id}>
                <Link to={`/reservas/${reserva.id}`} className={estilos.fila}>
                  <span className={estilos.habitaciones}>{reserva.habitaciones.join(' · ')}</span>
                  <span className={estilos.datos}>
                    <strong>{reserva.titular}</strong>
                    <small>
                      {reserva.codigo}
                      {atrasada && ` · debía salir el ${formatearFecha(reserva.fechaSalida)}`}
                      {tipo === 'llegada' && reserva.estado === 'PENDIENTE' && ' · sin anticipo'}
                    </small>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Tarjeta>
  );
}

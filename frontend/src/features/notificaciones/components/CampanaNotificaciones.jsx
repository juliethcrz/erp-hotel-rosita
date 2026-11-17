import { Bell } from 'lucide-react';
import { useState } from 'react';
import { cx } from '../../../lib/clases.js';
import { formatearFechaHora } from '../../../lib/formato.js';
import { useNotificaciones } from '../hooks/useNotificaciones.js';
import estilos from './CampanaNotificaciones.module.css';

export function CampanaNotificaciones({ posicion = 'lateral' }) {
  const { notificaciones, noLeidas, marcarLeida, marcarTodas } = useNotificaciones();
  const [abierta, setAbierta] = useState(false);

  return (
    <div className={estilos.contenedor}>
      <button
        type="button"
        className={estilos.campana}
        onClick={() => setAbierta(!abierta)}
        aria-label={`Notificaciones, ${noLeidas} sin leer`}
        aria-expanded={abierta}
      >
        <Bell size={20} />
        {noLeidas > 0 && <span className={estilos.contador}>{noLeidas}</span>}
      </button>

      {abierta && (
        <div className={cx(estilos.panel, estilos[posicion])}>
          <header>
            <strong>Notificaciones</strong>
            {noLeidas > 0 && (
              <button type="button" className={estilos.leerTodas} onClick={marcarTodas}>
                Marcar todas como leídas
              </button>
            )}
          </header>
          <ul>
            {notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  className={cx(estilos.aviso, !notificacion.leida && estilos.noLeida)}
                  onClick={() => marcarLeida(notificacion)}
                >
                  <strong>{notificacion.titulo}</strong>
                  <span>{notificacion.mensaje}</span>
                  <small>{formatearFechaHora(notificacion.creadaEn)}</small>
                </button>
              </li>
            ))}
            {notificaciones.length === 0 && <li className={estilos.vacio}>No tienes avisos.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

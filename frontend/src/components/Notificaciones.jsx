import { Bell } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formatearFechaHora } from '../utils/formato.js';

const INTERVALO_MS = 20_000;

export function Notificaciones() {
  const [datos, setDatos] = useState({ notificaciones: [], noLeidas: 0 });
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(() => {
    api
      .get('/notificaciones')
      .then(setDatos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const marcarLeida = async (notificacion) => {
    if (notificacion.leida) return;
    await api.post(`/notificaciones/${notificacion.id}/leer`);
    cargar();
  };

  const marcarTodas = async () => {
    await api.post('/notificaciones/leer-todas');
    cargar();
  };

  return (
    <div className="notificaciones">
      <button
        type="button"
        className="boton-icono campana"
        onClick={() => setAbierto(!abierto)}
        aria-label={`Notificaciones, ${datos.noLeidas} sin leer`}
      >
        <Bell size={20} />
        {datos.noLeidas > 0 && <span className="contador">{datos.noLeidas}</span>}
      </button>

      {abierto && (
        <div className="panel-notificaciones">
          <header>
            <strong>Notificaciones</strong>
            {datos.noLeidas > 0 && (
              <button type="button" className="boton boton-pequeno" onClick={marcarTodas}>
                Marcar todas como leídas
              </button>
            )}
          </header>
          <ul>
            {datos.notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  className={notificacion.leida ? '' : 'no-leida'}
                  onClick={() => marcarLeida(notificacion)}
                >
                  <strong>{notificacion.titulo}</strong>
                  <span>{notificacion.mensaje}</span>
                  <small>{formatearFechaHora(notificacion.creadaEn)}</small>
                </button>
              </li>
            ))}
            {datos.notificaciones.length === 0 && (
              <li className="sin-notificaciones">No hay notificaciones.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

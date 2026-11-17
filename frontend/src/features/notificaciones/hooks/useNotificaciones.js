import { useCallback, useEffect, useState } from 'react';
import { notificacionesApi } from '../api/notificacionesApi.js';

const INTERVALO_MS = 20_000;

/** Consulta los avisos del rol cada 20 segundos y permite marcarlos como leídos. */
export function useNotificaciones() {
  const [datos, setDatos] = useState({ notificaciones: [], noLeidas: 0 });

  const recargar = useCallback(() => {
    notificacionesApi
      .listar()
      .then(setDatos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    recargar();
    const intervalo = setInterval(recargar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [recargar]);

  const marcarLeida = async (notificacion) => {
    if (notificacion.leida) return;
    await notificacionesApi.marcarLeida(notificacion.id);
    recargar();
  };

  const marcarTodas = async () => {
    await notificacionesApi.marcarTodas();
    recargar();
  };

  return { ...datos, marcarLeida, marcarTodas };
}

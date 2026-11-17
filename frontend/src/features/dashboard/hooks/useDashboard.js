import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi.js';

const INTERVALO_MS = 60_000;

/** Datos del inicio; se actualizan cada minuto para que recepción vea los cambios. */
export function useDashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = () =>
      dashboardApi
        .obtener()
        .then((respuesta) => {
          setDatos(respuesta);
          setError(null);
        })
        .catch(setError);

    cargar();
    const temporizador = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(temporizador);
  }, []);

  return { datos, error };
}

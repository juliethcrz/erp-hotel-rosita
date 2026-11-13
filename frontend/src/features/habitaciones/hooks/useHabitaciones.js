import { useCallback, useEffect, useState } from 'react';
import { habitacionesApi } from '../api/habitacionesApi.js';

export function useHabitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(() => {
    return habitacionesApi
      .listar()
      .then(setHabitaciones)
      .catch(setError)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    habitacionesApi
      .listar()
      .then(setHabitaciones)
      .catch(setError)
      .finally(() => setCargando(false));
  }, []);

  const cambiarEstado = async (id, estado) => {
    await habitacionesApi.cambiarEstado(id, estado);
    await recargar();
  };

  return { habitaciones, cargando, error, recargar, cambiarEstado };
}

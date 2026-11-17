import { useEffect, useState } from 'react';
import { reservasApi } from '../api/reservasApi.js';

const ESPERA_MS = 300;

/** Listado de reservas filtrado por estado y por texto, con espera al teclear. */
export function useReservas() {
  const [reservas, setReservas] = useState([]);
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      reservasApi.listar({ estado, buscar: busqueda.trim() }).then(setReservas).catch(setError);
    }, ESPERA_MS);
    return () => clearTimeout(temporizador);
  }, [estado, busqueda]);

  return { reservas, estado, setEstado, busqueda, setBusqueda, error };
}

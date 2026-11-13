import { useCallback, useEffect, useState } from 'react';
import { limpiezasApi } from '../api/limpiezasApi.js';

const INTERVALO_MS = 20_000;

/** Tareas de limpieza del día, actualizadas cada 20 segundos. */
export function useLimpiezas() {
  const [limpiezas, setLimpiezas] = useState([]);
  const [error, setError] = useState(null);

  const recargar = useCallback(() => {
    limpiezasApi.listar().then(setLimpiezas).catch(setError);
  }, []);

  useEffect(() => {
    recargar();
    const intervalo = setInterval(recargar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [recargar]);

  const iniciar = async (limpieza) => {
    setError(null);
    try {
      await limpiezasApi.iniciar(limpieza.id);
      recargar();
    } catch (err) {
      setError(err);
    }
  };

  const terminar = async (limpieza, observaciones) => {
    await limpiezasApi.terminar(limpieza.id, observaciones);
    recargar();
  };

  return { limpiezas, error, iniciar, terminar };
}

import { useCallback, useEffect, useState } from 'react';
import { cajaApi } from '../api/cajaApi.js';

export function useCaja({ conHistorial }) {
  const [caja, setCaja] = useState(undefined);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);

  const recargar = useCallback(() => {
    cajaApi.actual().then(setCaja).catch(setError);
    if (conHistorial) cajaApi.historial().then(setHistorial).catch(setError);
  }, [conHistorial]);

  useEffect(() => {
    cajaApi.actual().then(setCaja).catch(setError);
    if (conHistorial) cajaApi.historial().then(setHistorial).catch(setError);
  }, [conHistorial]);

  const ejecutar = async (accion) => {
    setError(null);
    try {
      const resultado = await accion();
      recargar();
      return resultado;
    } catch (err) {
      setError(err);
      return null;
    }
  };

  return {
    caja,
    historial,
    error,
    abrir: () => ejecutar(cajaApi.abrir),
    cerrar: () => ejecutar(cajaApi.cerrar),
  };
}

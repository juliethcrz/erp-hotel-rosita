import { useCallback, useEffect, useState } from 'react';
import { clientesApi } from '../api/clientesApi.js';

const ESPERA_MS = 300;

/** Busca clientes mientras se escribe, esperando a que la persona deje de teclear. */
export function useBusquedaClientes({ minimo = 0 } = {}) {
  const [texto, setTexto] = useState('');
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const consulta = texto.trim();

  useEffect(() => {
    if (consulta.length < minimo) return undefined;
    const temporizador = setTimeout(() => {
      clientesApi.buscar(consulta).then(setClientes).catch(setError);
    }, ESPERA_MS);
    return () => clearTimeout(temporizador);
  }, [consulta, minimo]);

  const recargar = useCallback(() => clientesApi.buscar(consulta).then(setClientes), [consulta]);

  return { texto, setTexto, clientes, error, recargar, activa: consulta.length >= minimo };
}

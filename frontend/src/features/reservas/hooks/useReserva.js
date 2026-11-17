import { useCallback, useEffect, useState } from 'react';
import { reservasApi } from '../api/reservasApi.js';

/** Una reserva y las acciones de su ciclo (anticipo, check-in, consumos, check-out…). */
export function useReserva(id) {
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    reservasApi.obtener(id).then(setReserva).catch(setError);
  }, [id]);

  const ejecutar = useCallback(
    async (accion, cuerpo) => {
      const resultado = await reservasApi.ejecutar(id, accion, cuerpo);
      setReserva(resultado);
      return resultado;
    },
    [id],
  );

  return { reserva, error, setError, ejecutar };
}

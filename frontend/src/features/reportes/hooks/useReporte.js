import { useEffect, useState } from 'react';
import { reportesApi } from '../api/reportesApi.js';

/** Datos de un reporte; se vuelven a pedir cada vez que cambia el tipo o el periodo. */
export function useReporte(tipo, { desde, hasta }) {
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: null });
  const clave = `${tipo}|${desde}|${hasta}`;
  const valido = Boolean(desde && hasta && hasta >= desde);

  useEffect(() => {
    if (!valido) return undefined;
    let vigente = true;
    reportesApi
      .consultar(tipo, { desde, hasta })
      .then((datos) => vigente && setResultado({ clave, datos, error: null }))
      .catch((error) => vigente && setResultado({ clave, datos: null, error }));
    return () => {
      vigente = false;
    };
  }, [tipo, desde, hasta, clave, valido]);

  const actual = resultado.clave === clave;
  return {
    datos: actual ? resultado.datos : null,
    error: actual ? resultado.error : null,
    cargando: valido && !actual,
  };
}

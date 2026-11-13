import { useState } from 'react';
import { reportesApi } from '../api/reportesApi.js';
import { guardarArchivo } from '../utils/periodos.js';

export function useExportarReporte(tipo, periodo) {
  const [exportando, setExportando] = useState(null);
  const [error, setError] = useState(null);

  const exportar = async (formato) => {
    setExportando(formato);
    setError(null);
    try {
      const archivo = await reportesApi.exportar(tipo, periodo, formato);
      guardarArchivo(archivo, `reporte-${tipo}-${periodo.desde}-a-${periodo.hasta}.${formato}`);
    } catch (err) {
      setError(err);
    } finally {
      setExportando(null);
    }
  };

  return { exportar, exportando, error };
}

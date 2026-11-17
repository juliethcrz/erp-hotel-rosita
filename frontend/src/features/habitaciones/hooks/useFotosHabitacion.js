import { useState } from 'react';
import { habitacionesApi } from '../api/habitacionesApi.js';

/** Acciones sobre las fotos de una habitación; al terminar cada una avisa para recargar el rack. */
export function useFotosHabitacion(habitacionId, onCambio) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = async (accion) => {
    setProcesando(true);
    setError(null);
    try {
      await accion();
      await onCambio();
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  const mover = (fotos, indice, desplazamiento) => {
    const ids = fotos.map((foto) => foto.id);
    const destino = indice + desplazamiento;
    [ids[indice], ids[destino]] = [ids[destino], ids[indice]];
    return ejecutar(() => habitacionesApi.ordenarFotos(habitacionId, ids));
  };

  return {
    procesando,
    error,
    subir: (archivos) => ejecutar(() => habitacionesApi.subirFotos(habitacionId, archivos)),
    marcarPrincipal: (fotoId) =>
      ejecutar(() => habitacionesApi.marcarPrincipal(habitacionId, fotoId)),
    eliminar: (fotoId) => ejecutar(() => habitacionesApi.eliminarFoto(habitacionId, fotoId)),
    mover,
  };
}

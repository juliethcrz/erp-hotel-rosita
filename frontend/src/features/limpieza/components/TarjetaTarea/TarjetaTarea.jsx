import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { Boton } from '../../../../components/ui/index.js';
import { formatearFechaHora } from '../../../../lib/formato.js';
import estilos from './TarjetaTarea.module.css';

export function TarjetaTarea({ limpieza, onIniciar, onTerminar }) {
  const { habitacion, estado, responsable } = limpieza;

  return (
    <article className={estilos.tarea}>
      <div className={estilos.encabezado}>
        <span className={estilos.numero}>{habitacion.numero}</span>
        <span className={estilos.tipo}>{habitacion.tipo.nombre}</span>
      </div>

      {estado === 'PENDIENTE' && (
        <>
          <small className={estilos.meta}>
            <Clock size={14} aria-hidden="true" /> Desde {formatearFechaHora(limpieza.creadaEn)}
          </small>
          <Boton variante="primario" tamano="sm" icono={PlayCircle} onClick={onIniciar} ancho>
            Iniciar limpieza
          </Boton>
        </>
      )}

      {estado === 'EN_PROCESO' && (
        <>
          <small className={estilos.meta}>
            {responsable?.nombre} · desde {formatearFechaHora(limpieza.iniciadaEn)}
          </small>
          <Boton variante="primario" tamano="sm" icono={CheckCircle2} onClick={onTerminar} ancho>
            Marcar lista
          </Boton>
        </>
      )}

      {estado === 'TERMINADA' && (
        <>
          <small className={estilos.meta}>
            {responsable?.nombre ?? 'Administrador'} · {formatearFechaHora(limpieza.terminadaEn)}
          </small>
          {limpieza.observaciones && (
            <p className={estilos.observacion}>{limpieza.observaciones}</p>
          )}
        </>
      )}
    </article>
  );
}

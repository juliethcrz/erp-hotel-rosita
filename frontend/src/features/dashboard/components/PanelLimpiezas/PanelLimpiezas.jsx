import { Insignia, Tarjeta } from '../../../../components/ui/index.js';
import { formatearFechaHora } from '../../../../lib/formato.js';
import estilos from './PanelLimpiezas.module.css';

/** Habitaciones por limpiar o en limpieza, en orden de llegada. */
export function PanelLimpiezas({ limpiezas, acciones }) {
  const tareas = [...limpiezas.enProceso, ...limpiezas.pendientes];

  return (
    <Tarjeta titulo="Limpieza" acciones={acciones}>
      {tareas.length === 0 ? (
        <p className={estilos.vacio}>No hay habitaciones por limpiar.</p>
      ) : (
        <ul className={estilos.lista}>
          {tareas.map((tarea) => (
            <li key={tarea.id}>
              <span className={estilos.numero}>{tarea.habitacion}</span>
              <span className={estilos.datos}>
                <strong>{tarea.nombreHabitacion ?? `Habitación ${tarea.habitacion}`}</strong>
                <small>
                  {tarea.estado === 'EN_PROCESO'
                    ? `${tarea.responsable ?? 'Housekeeping'} · desde ${formatearFechaHora(tarea.iniciadaEn)}`
                    : `Desde ${formatearFechaHora(tarea.creadaEn)}`}
                </small>
              </span>
              <Insignia tono={tarea.estado === 'EN_PROCESO' ? 'info' : 'aviso'} punto>
                {tarea.estado === 'EN_PROCESO' ? 'En proceso' : 'Pendiente'}
              </Insignia>
            </li>
          ))}
        </ul>
      )}
      <p className={estilos.pie}>Terminadas hoy: {limpiezas.terminadasHoy}</p>
    </Tarjeta>
  );
}

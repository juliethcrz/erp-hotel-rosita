import { BedDouble, CalendarPlus, Users, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import {
  AlertaError,
  Boton,
  Insignia,
  ListaValores,
  Modal,
} from '../../../../components/ui/index.js';
import { ESTADOS_HABITACION } from '../../../../constants/catalogos.js';
import { cx } from '../../../../lib/clases.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { estadosPermitidos, TONO_ESTADO } from '../../utils/estadosHabitacion.js';
import estilos from './DetalleHabitacion.module.css';

const TEXTO_ACCION = {
  EN_MANTENIMIENTO: 'Enviar a mantenimiento',
  DISPONIBLE: 'Marcar como disponible',
};

const AYUDA_ESTADO = {
  OCUPADA: 'El estado cambia al hacer el check-out.',
  EN_LIMPIEZA: 'Housekeeping la marca como lista desde la pantalla de limpieza.',
};

/** Panel deslizante con la ficha de la habitación y sus acciones. */
export function DetalleHabitacion({ habitacion, rol, onCambiarEstado, onCerrar }) {
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const { numero, tipo, estado, estadoRack, reservaHoy, descripcion } = habitacion;
  const acciones = estadosPermitidos(rol, estado);

  const cambiar = async (nuevoEstado) => {
    setGuardando(true);
    setError(null);
    try {
      await onCambiarEstado(habitacion.id, nuevoEstado);
      onCerrar();
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  const cabecera = (
    <div className={cx(estilos.portada, estilos[`tipo${tipo.id % 4}`])}>
      <BedDouble className={estilos.icono} size={64} strokeWidth={1.2} aria-hidden="true" />
      <button type="button" className={estilos.cerrar} onClick={onCerrar} aria-label="Cerrar">
        <X size={18} />
      </button>
      <div className={estilos.titulo}>
        <Insignia tono={TONO_ESTADO[estadoRack]} punto>
          {ESTADOS_HABITACION[estadoRack]}
        </Insignia>
        <h2>Habitación {numero}</h2>
        <p>
          {tipo.nombre} · piso {habitacion.piso}
        </p>
      </div>
    </div>
  );

  return (
    <Modal titulo={`Habitación ${numero}`} lateral cabecera={cabecera} onCerrar={onCerrar}>
      <div className={estilos.contenido}>
        <div className={estilos.datosClave}>
          <div>
            <Users size={18} aria-hidden="true" />
            <span>
              Hasta {tipo.capacidadMaxima} {tipo.capacidadMaxima === 1 ? 'persona' : 'personas'}
            </span>
          </div>
          <div>
            <strong>{formatearPesos(tipo.tarifaBase)}</strong>
            <span>por noche</span>
          </div>
        </div>

        {(descripcion || tipo.descripcion) && (
          <p className={estilos.descripcion}>{descripcion || tipo.descripcion}</p>
        )}

        {reservaHoy && (
          <ListaValores filas={[{ etiqueta: 'Reserva de hoy', valor: reservaHoy.codigo }]} />
        )}

        {AYUDA_ESTADO[estado] && <p className={estilos.ayuda}>{AYUDA_ESTADO[estado]}</p>}

        <AlertaError error={error} />

        <div className={estilos.acciones}>
          {estado === 'DISPONIBLE' && rol !== 'HOUSEKEEPING' && (
            <Boton variante="primario" icono={CalendarPlus} to="/reservas/nueva" ancho>
              Nueva reserva
            </Boton>
          )}
          {estado === 'EN_LIMPIEZA' && rol !== 'RECEPCIONISTA' && (
            <Boton to="/limpieza" ancho>
              Ir a la pantalla de limpieza
            </Boton>
          )}
          {acciones.map((nuevoEstado) => (
            <Boton
              key={nuevoEstado}
              icono={nuevoEstado === 'EN_MANTENIMIENTO' ? Wrench : undefined}
              disabled={guardando}
              onClick={() => cambiar(nuevoEstado)}
              ancho
            >
              {TEXTO_ACCION[nuevoEstado]}
            </Boton>
          ))}
        </div>
      </div>
    </Modal>
  );
}

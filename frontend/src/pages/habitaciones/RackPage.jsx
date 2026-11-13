import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ESTADOS_HABITACION, estadosPermitidos } from '../../constants/catalogos.js';
import { formatearPesos } from '../../utils/formato.js';

function agruparPorPiso(habitaciones) {
  return habitaciones.reduce((pisos, habitacion) => {
    (pisos[habitacion.piso] ??= []).push(habitacion);
    return pisos;
  }, {});
}

export function RackPage() {
  const { usuario } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setHabitaciones(await api.get('/habitaciones'));
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    api.get('/habitaciones').then(setHabitaciones).catch(setError);
  }, []);

  const cambiarEstado = async (estado) => {
    setGuardando(true);
    setError(null);
    try {
      await api.patch(`/habitaciones/${seleccionada.id}/estado`, { estado });
      setSeleccionada(null);
      await cargar();
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  };

  const pisos = agruparPorPiso(habitaciones);
  const opciones = seleccionada ? estadosPermitidos(usuario.rol, seleccionada.estado) : [];

  return (
    <>
      <EncabezadoPagina titulo="Habitaciones" descripcion="Estado de las habitaciones hoy" />
      <MensajeError error={!seleccionada ? error : null} />

      <ul className="leyenda">
        {Object.entries(ESTADOS_HABITACION).map(([estado, etiqueta]) => (
          <li key={estado}>
            <span className={`punto estado-${estado}`} />
            {etiqueta}
          </li>
        ))}
      </ul>

      {Object.entries(pisos).map(([piso, lista]) => (
        <section key={piso} className="rack-piso">
          <h2>Piso {piso}</h2>
          <div className="rack">
            {lista.map((habitacion) => (
              <button
                key={habitacion.id}
                type="button"
                className={`rack-celda estado-${habitacion.estadoRack}`}
                onClick={() => setSeleccionada(habitacion)}
              >
                <strong>{habitacion.numero}</strong>
                <span>{habitacion.tipo.nombre}</span>
                <small>{ESTADOS_HABITACION[habitacion.estadoRack]}</small>
              </button>
            ))}
          </div>
        </section>
      ))}

      {seleccionada && (
        <Modal titulo={`Habitación ${seleccionada.numero}`} onCerrar={() => setSeleccionada(null)}>
          <dl className="detalle">
            <dt>Tipo</dt>
            <dd>
              {seleccionada.tipo.nombre} · hasta {seleccionada.tipo.capacidadMaxima}{' '}
              {seleccionada.tipo.capacidadMaxima === 1 ? 'persona' : 'personas'}
            </dd>
            <dt>Tarifa base</dt>
            <dd>{formatearPesos(seleccionada.tipo.tarifaBase)} por noche</dd>
            <dt>Estado</dt>
            <dd>{ESTADOS_HABITACION[seleccionada.estadoRack]}</dd>
            {seleccionada.reservaHoy && (
              <>
                <dt>Reserva de hoy</dt>
                <dd>{seleccionada.reservaHoy.codigo}</dd>
              </>
            )}
          </dl>

          <MensajeError error={error} />

          {seleccionada.estado === 'EN_LIMPIEZA' && usuario.rol !== 'RECEPCIONISTA' && (
            <Link to="/limpieza" className="boton boton-pequeno">
              Ir a la pantalla de limpieza
            </Link>
          )}

          {opciones.length > 0 ? (
            <div className="acciones-modal">
              {opciones.map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className="boton"
                  disabled={guardando}
                  onClick={() => cambiarEstado(estado)}
                >
                  {estado === 'EN_MANTENIMIENTO'
                    ? 'Enviar a mantenimiento'
                    : 'Marcar como disponible'}
                </button>
              ))}
            </div>
          ) : (
            <p className="texto-suave">
              {seleccionada.estado === 'OCUPADA' && 'El estado cambia al hacer el check-out.'}
              {seleccionada.estado === 'EN_LIMPIEZA' &&
                'Housekeeping la marca como lista desde la pantalla de limpieza.'}
              {['DISPONIBLE', 'EN_MANTENIMIENTO'].includes(seleccionada.estado) &&
                'El mantenimiento lo maneja el administrador.'}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}

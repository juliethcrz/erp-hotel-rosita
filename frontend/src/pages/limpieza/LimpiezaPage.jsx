import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatearFechaHora } from '../../utils/formato.js';

const INTERVALO_MS = 20_000;

const COLUMNAS = [
  { estado: 'PENDIENTE', titulo: 'Pendientes' },
  { estado: 'EN_PROCESO', titulo: 'En proceso' },
  { estado: 'TERMINADA', titulo: 'Listas hoy' },
];

export function LimpiezaPage() {
  const [limpiezas, setLimpiezas] = useState([]);
  const [terminando, setTerminando] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(() => {
    api.get('/limpiezas').then(setLimpiezas).catch(setError);
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const ejecutar = async (accion) => {
    setProcesando(true);
    setError(null);
    try {
      await accion();
      setTerminando(null);
      setObservaciones('');
      cargar();
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  const iniciar = (limpieza) => ejecutar(() => api.post(`/limpiezas/${limpieza.id}/iniciar`));

  const terminar = (evento) => {
    evento.preventDefault();
    ejecutar(() =>
      api.post(`/limpiezas/${terminando.id}/terminar`, {
        observaciones: observaciones.trim() || undefined,
      }),
    );
  };

  return (
    <>
      <EncabezadoPagina
        titulo="Limpieza"
        descripcion="Las habitaciones llegan aquí solas cuando el huésped hace check-out"
      />
      <MensajeError error={!terminando ? error : null} />

      <div className="tablero">
        {COLUMNAS.map(({ estado, titulo }) => {
          const tareas = limpiezas.filter((limpieza) => limpieza.estado === estado);
          return (
            <section key={estado} className={`columna columna-${estado}`}>
              <h2>
                {titulo} <span>{tareas.length}</span>
              </h2>

              {tareas.map((limpieza) => (
                <article key={limpieza.id} className="tarjeta-tarea">
                  <strong>Habitación {limpieza.habitacion.numero}</strong>
                  <span>{limpieza.habitacion.tipo.nombre}</span>

                  {estado === 'PENDIENTE' && (
                    <>
                      <small>Desde {formatearFechaHora(limpieza.creadaEn)}</small>
                      <button
                        type="button"
                        className="boton boton-primario boton-pequeno"
                        disabled={procesando}
                        onClick={() => iniciar(limpieza)}
                      >
                        Iniciar limpieza
                      </button>
                    </>
                  )}

                  {estado === 'EN_PROCESO' && (
                    <>
                      <small>
                        {limpieza.responsable?.nombre} · desde{' '}
                        {formatearFechaHora(limpieza.iniciadaEn)}
                      </small>
                      <button
                        type="button"
                        className="boton boton-primario boton-pequeno"
                        onClick={() => setTerminando(limpieza)}
                      >
                        Marcar lista
                      </button>
                    </>
                  )}

                  {estado === 'TERMINADA' && (
                    <>
                      <small>
                        {limpieza.responsable?.nombre ?? 'Administrador'} ·{' '}
                        {formatearFechaHora(limpieza.terminadaEn)}
                      </small>
                      {limpieza.observaciones && <em>{limpieza.observaciones}</em>}
                    </>
                  )}
                </article>
              ))}

              {tareas.length === 0 && <p className="texto-suave">Sin habitaciones.</p>}
            </section>
          );
        })}
      </div>

      {terminando && (
        <Modal
          titulo={`Habitación ${terminando.habitacion.numero} lista`}
          onCerrar={() => setTerminando(null)}
        >
          <form className="formulario" onSubmit={terminar}>
            <MensajeError error={error} />
            <label className="campo">
              <span>Observaciones (opcional)</span>
              <textarea
                rows={3}
                placeholder="Por ejemplo: el control del TV no funciona"
                value={observaciones}
                onChange={(evento) => setObservaciones(evento.target.value)}
              />
            </label>
            <p className="texto-suave">
              Recepción y el administrador recibirán el aviso de que la habitación está lista. Las
              observaciones le llegan al administrador.
            </p>
            <div className="acciones-modal">
              <button type="button" className="boton" onClick={() => setTerminando(null)}>
                Cancelar
              </button>
              <button type="submit" className="boton boton-primario" disabled={procesando}>
                Confirmar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

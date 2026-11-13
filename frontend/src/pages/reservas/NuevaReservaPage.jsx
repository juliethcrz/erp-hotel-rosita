import { Check, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { FormularioPagos } from '../../components/FormularioPagos.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatearFecha, formatearPesos, hoyLocal } from '../../utils/formato.js';
import { ClienteForm } from '../clientes/ClienteForm.jsx';

const PASOS = ['Fechas', 'Habitaciones', 'Titular', 'Confirmación'];

function Pasos({ actual }) {
  return (
    <ol className="pasos">
      {PASOS.map((paso, indice) => (
        <li key={paso} className={indice === actual ? 'actual' : indice < actual ? 'hecho' : ''}>
          <span>{indice < actual ? <Check size={14} /> : indice + 1}</span>
          {paso}
        </li>
      ))}
    </ol>
  );
}

function BuscadorTitular({ titular, onSeleccionar }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    if (busqueda.trim().length < 2) return undefined;
    const temporizador = setTimeout(() => {
      api
        .get(`/clientes?buscar=${encodeURIComponent(busqueda.trim())}`)
        .then(setResultados)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const crear = async (datos) => {
    const cliente = await api.post('/clientes', datos);
    setCreando(false);
    onSeleccionar(cliente);
  };

  return (
    <>
      {titular && (
        <div className="seleccion-actual">
          <Check size={16} /> {titular.nombres} {titular.apellidos} · {titular.tipoDocumento}{' '}
          {titular.numeroDocumento}
        </div>
      )}

      <div className="filtros">
        <label className="buscador">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar cliente por nombre o documento"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>
        <button type="button" className="boton" onClick={() => setCreando(true)}>
          Registrar cliente nuevo
        </button>
      </div>

      {busqueda.trim().length >= 2 && (
        <ul className="lista-seleccion">
          {resultados.map((cliente) => (
            <li key={cliente.id}>
              <button type="button" onClick={() => onSeleccionar(cliente)}>
                <strong>
                  {cliente.nombres} {cliente.apellidos}
                </strong>
                <span>
                  {cliente.tipoDocumento} {cliente.numeroDocumento}
                </span>
              </button>
            </li>
          ))}
          {resultados.length === 0 && <li className="texto-suave">Sin resultados.</li>}
        </ul>
      )}

      {creando && (
        <Modal titulo="Nuevo cliente" onCerrar={() => setCreando(false)}>
          <ClienteForm onGuardar={crear} onCancelar={() => setCreando(false)} />
        </Modal>
      )}
    </>
  );
}

export function NuevaReservaPage() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);
  const [fechas, setFechas] = useState({ llegada: hoyLocal(), salida: '' });
  const [disponibles, setDisponibles] = useState([]);
  const [cotizaciones, setCotizaciones] = useState({});
  const [seleccion, setSeleccion] = useState([]);
  const [titular, setTitular] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [cobrandoAnticipo, setCobrandoAnticipo] = useState(false);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const buscarDisponibilidad = async (evento) => {
    evento.preventDefault();
    setProcesando(true);
    setError(null);
    try {
      const consulta = `llegada=${fechas.llegada}&salida=${fechas.salida}`;
      const habitaciones = await api.get(`/habitaciones/disponibles?${consulta}`);
      const tipos = [...new Set(habitaciones.map((h) => h.tipoId))];
      const precios = await Promise.all(
        tipos.map((tipoId) => api.get(`/tarifas/cotizar?tipoId=${tipoId}&${consulta}`)),
      );
      setDisponibles(habitaciones);
      setCotizaciones(Object.fromEntries(tipos.map((tipoId, i) => [tipoId, precios[i]])));
      setSeleccion([]);
      setPaso(1);
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  const alternar = (habitacionId) => {
    setSeleccion(
      seleccion.includes(habitacionId)
        ? seleccion.filter((id) => id !== habitacionId)
        : [...seleccion, habitacionId],
    );
  };

  const elegidas = disponibles.filter((h) => seleccion.includes(h.id));
  const totalHabitaciones = elegidas.reduce((suma, h) => suma + cotizaciones[h.tipoId].total, 0);
  const valorDescuento = Math.round((totalHabitaciones * descuento) / 100);
  const totalEstadia = totalHabitaciones - valorDescuento;
  const anticipo = Math.round(totalEstadia * 0.5);
  const noches = elegidas[0] ? cotizaciones[elegidas[0].tipoId].noches.length : 0;

  const guardar = async (pagosAnticipo) => {
    setError(null);
    const reserva = await api.post('/reservas', {
      titularId: titular.id,
      fechaLlegada: fechas.llegada,
      fechaSalida: fechas.salida,
      habitaciones: seleccion.map((habitacionId, indice) => ({
        habitacionId,
        huespedes: indice === 0 ? [titular.id] : [],
      })),
      descuentoPorcentaje: Number(descuento) || 0,
      observaciones: observaciones.trim() || null,
      ...(pagosAnticipo && { anticipo: { pagos: pagosAnticipo } }),
    });
    navigate(`/reservas/${reserva.id}`);
  };

  const guardarPendiente = async () => {
    setProcesando(true);
    try {
      await guardar();
    } catch (err) {
      setError(err);
      setProcesando(false);
    }
  };

  return (
    <>
      <EncabezadoPagina titulo="Nueva reserva" />
      <Pasos actual={paso} />
      <MensajeError error={!cobrandoAnticipo ? error : null} />

      {paso === 0 && (
        <form className="tarjeta formulario formulario-angosto" onSubmit={buscarDisponibilidad}>
          <div className="fila-campos">
            <label className="campo">
              <span>Llegada</span>
              <input
                type="date"
                min={hoyLocal()}
                value={fechas.llegada}
                onChange={(evento) => setFechas({ ...fechas, llegada: evento.target.value })}
                required
              />
            </label>
            <label className="campo">
              <span>Salida</span>
              <input
                type="date"
                min={fechas.llegada}
                value={fechas.salida}
                onChange={(evento) => setFechas({ ...fechas, salida: evento.target.value })}
                required
              />
            </label>
          </div>
          <div className="acciones-modal">
            <button type="submit" className="boton boton-primario" disabled={procesando}>
              Ver habitaciones disponibles
            </button>
          </div>
        </form>
      )}

      {paso === 1 && (
        <>
          <p className="texto-suave">
            {formatearFecha(fechas.llegada)} → {formatearFecha(fechas.salida)} ·{' '}
            {disponibles.length} habitaciones disponibles
          </p>
          <div className="rack">
            {disponibles.map((habitacion) => {
              const cotizacion = cotizaciones[habitacion.tipoId];
              const elegida = seleccion.includes(habitacion.id);
              return (
                <button
                  key={habitacion.id}
                  type="button"
                  className={`rack-celda seleccionable ${elegida ? 'elegida' : ''}`}
                  onClick={() => alternar(habitacion.id)}
                >
                  <strong>{habitacion.numero}</strong>
                  <span>
                    {habitacion.tipo.nombre} · {habitacion.tipo.capacidadMaxima} pers.
                  </span>
                  <small>{formatearPesos(cotizacion.total)}</small>
                </button>
              );
            })}
          </div>
          <div className="barra-pasos">
            <button type="button" className="boton" onClick={() => setPaso(0)}>
              Cambiar fechas
            </button>
            <button
              type="button"
              className="boton boton-primario"
              disabled={seleccion.length === 0}
              onClick={() => setPaso(2)}
            >
              Continuar con {seleccion.length} habitación{seleccion.length === 1 ? '' : 'es'}
            </button>
          </div>
        </>
      )}

      {paso === 2 && (
        <>
          <BuscadorTitular titular={titular} onSeleccionar={setTitular} />
          <div className="barra-pasos">
            <button type="button" className="boton" onClick={() => setPaso(1)}>
              Volver
            </button>
            <button
              type="button"
              className="boton boton-primario"
              disabled={!titular}
              onClick={() => setPaso(3)}
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {paso === 3 && (
        <div className="tarjeta">
          <dl className="detalle">
            <dt>Titular</dt>
            <dd>
              {titular.nombres} {titular.apellidos}
            </dd>
            <dt>Fechas</dt>
            <dd>
              {formatearFecha(fechas.llegada)} → {formatearFecha(fechas.salida)} ({noches}{' '}
              {noches === 1 ? 'noche' : 'noches'})
            </dd>
            {elegidas.map((habitacion) => (
              <div key={habitacion.id} className="contenido-detalle">
                <dt>Habitación {habitacion.numero}</dt>
                <dd>
                  {habitacion.tipo.nombre} · {formatearPesos(cotizaciones[habitacion.tipoId].total)}
                  {cotizaciones[habitacion.tipoId].noches.some((noche) => noche.temporada) &&
                    ' (incluye noches de temporada alta)'}
                </dd>
              </div>
            ))}
          </dl>

          <div className="fila-campos">
            <label className="campo">
              <span>Descuento sobre habitaciones (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={descuento}
                onChange={(evento) => setDescuento(evento.target.value)}
              />
            </label>
            <label className="campo">
              <span>Observaciones</span>
              <input
                value={observaciones}
                onChange={(evento) => setObservaciones(evento.target.value)}
              />
            </label>
          </div>

          <dl className="totales">
            <dt>Habitaciones</dt>
            <dd>{formatearPesos(totalHabitaciones)}</dd>
            {valorDescuento > 0 && (
              <>
                <dt>Descuento</dt>
                <dd>−{formatearPesos(valorDescuento)}</dd>
              </>
            )}
            <dt>Total estadía (IVA incluido)</dt>
            <dd>
              <strong>{formatearPesos(totalEstadia)}</strong>
            </dd>
            <dt>Anticipo del 50 %</dt>
            <dd>{formatearPesos(anticipo)}</dd>
          </dl>

          <div className="barra-pasos">
            <button type="button" className="boton" onClick={() => setPaso(2)}>
              Volver
            </button>
            <div className="grupo-botones">
              <button
                type="button"
                className="boton"
                disabled={procesando}
                onClick={guardarPendiente}
              >
                Guardar sin anticipo
              </button>
              <button
                type="button"
                className="boton boton-primario"
                onClick={() => setCobrandoAnticipo(true)}
              >
                Cobrar anticipo y confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {cobrandoAnticipo && (
        <Modal titulo="Cobrar anticipo" onCerrar={() => setCobrandoAnticipo(false)}>
          <FormularioPagos
            monto={anticipo}
            textoBoton="Confirmar reserva"
            onConfirmar={guardar}
            onCancelar={() => setCobrandoAnticipo(false)}
          />
        </Modal>
      )}
    </>
  );
}

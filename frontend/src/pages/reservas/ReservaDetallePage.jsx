import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { EstadoReserva } from '../../components/EstadoReserva.jsx';
import { FormularioPagos } from '../../components/FormularioPagos.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { METODOS_PAGO, TIPOS_COBRO } from '../../constants/catalogos.js';
import { formatearFecha, formatearFechaHora, formatearPesos } from '../../utils/formato.js';

const LINEA_VACIA = { productoId: '', cantidad: 1 };

function FormularioConsumo({ onGuardar, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [lineas, setLineas] = useState([LINEA_VACIA]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.get('/inventario/productos').then(setProductos).catch(setError);
  }, []);

  const buscar = (productoId) => productos.find((p) => p.id === Number(productoId));

  const actualizar = (indice, campo, valor) => {
    setLineas(lineas.map((linea, i) => (i === indice ? { ...linea, [campo]: valor } : linea)));
  };

  const elegidos = lineas.map((linea) => linea.productoId).filter(Boolean);
  const total = lineas.reduce(
    (suma, linea) =>
      suma + (buscar(linea.productoId)?.precioVenta ?? 0) * Number(linea.cantidad || 0),
    0,
  );

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        items: lineas.map((linea) => ({
          productoId: Number(linea.productoId),
          cantidad: Number(linea.cantidad),
        })),
      });
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />

      {lineas.map((linea, indice) => {
        const producto = buscar(linea.productoId);
        return (
          <div key={indice} className="fila-consumo">
            <select
              value={linea.productoId}
              onChange={(e) => actualizar(indice, 'productoId', e.target.value)}
              aria-label="Producto"
              required
            >
              <option value="">Seleccione un producto…</option>
              {productos.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={
                    p.stockActual === 0 ||
                    (elegidos.includes(String(p.id)) && String(p.id) !== linea.productoId)
                  }
                >
                  {p.nombre} · {formatearPesos(p.precioVenta)} (quedan {p.stockActual})
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={producto?.stockActual ?? 50}
              value={linea.cantidad}
              onChange={(e) => actualizar(indice, 'cantidad', e.target.value)}
              aria-label="Cantidad"
              required
            />
            {lineas.length > 1 ? (
              <button
                type="button"
                className="boton-icono"
                onClick={() => setLineas(lineas.filter((_, i) => i !== indice))}
                aria-label="Quitar producto"
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <span />
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="boton boton-pequeno boton-texto"
        onClick={() => setLineas([...lineas, LINEA_VACIA])}
      >
        <Plus size={14} /> Agregar otro producto
      </button>

      <p className="monto-cobro">
        Se cargará a la habitación <strong>{formatearPesos(total)}</strong>
      </p>

      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          Cargar a la cuenta
        </button>
      </div>
    </form>
  );
}

export function ReservaDetallePage() {
  const { id } = useParams();
  const [reserva, setReserva] = useState(null);
  const [accion, setAccion] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/reservas/${id}`).then(setReserva).catch(setError);
  }, [id]);

  const ejecutar = useCallback(
    async (ruta, cuerpo) => {
      const actualizada = await api.post(`/reservas/${id}/${ruta}`, cuerpo);
      setReserva(actualizada);
      setAccion(null);
      return actualizada;
    },
    [id],
  );

  const ejecutarDirecto = async (ruta, cuerpo, confirmacion, mensajeExito) => {
    if (confirmacion && !window.confirm(confirmacion)) return;
    setError(null);
    setAviso(null);
    try {
      const actualizada = await ejecutar(ruta, cuerpo);
      if (mensajeExito) setAviso(mensajeExito(actualizada));
    } catch (err) {
      setError(err);
    }
  };

  if (!reserva) {
    return <MensajeError error={error} />;
  }

  const { resumen } = reserva;

  const hacerCheckin = () =>
    resumen.saldoEstadia > 0
      ? setAccion('checkin')
      : ejecutarDirecto('checkin', { pagos: [] }, '¿Confirmar el check-in?');

  const hacerCheckout = () =>
    resumen.consumosPendientes > 0
      ? setAccion('checkout')
      : ejecutarDirecto(
          'checkout',
          { pagos: [] },
          '¿Confirmar el check-out? Las habitaciones pasarán a limpieza.',
          () => 'Check-out registrado. Housekeeping ya recibió el aviso de limpieza.',
        );

  const cancelar = () =>
    ejecutarDirecto(
      'cancelar',
      {},
      '¿Cancelar la reserva? Si faltan más de 24 horas para la llegada se devuelve el anticipo.',
      (resultado) =>
        resultado.devolucion > 0
          ? `Reserva cancelada. Se registró la devolución de ${formatearPesos(resultado.devolucion)} en la caja.`
          : 'Reserva cancelada. El anticipo, si lo había, queda retenido por el hotel.',
    );

  return (
    <>
      <Link to="/reservas" className="volver">
        <ArrowLeft size={16} /> Reservas
      </Link>
      <EncabezadoPagina
        titulo={`Reserva ${reserva.codigo}`}
        descripcion={`${reserva.titular.nombres} ${reserva.titular.apellidos} · ${formatearFecha(reserva.fechaLlegada)} → ${formatearFecha(reserva.fechaSalida)}`}
        acciones={<EstadoReserva estado={reserva.estado} />}
      />

      {aviso && <div className="alerta alerta-exito">{aviso}</div>}
      <MensajeError error={accion ? null : error} />

      <div className="acciones-reserva">
        {reserva.estado === 'PENDIENTE' && (
          <button
            type="button"
            className="boton boton-primario"
            onClick={() => setAccion('anticipo')}
          >
            Registrar anticipo
          </button>
        )}
        {reserva.estado === 'CONFIRMADA' && (
          <>
            <button type="button" className="boton boton-primario" onClick={hacerCheckin}>
              Hacer check-in
            </button>
            <button
              type="button"
              className="boton"
              onClick={() =>
                ejecutarDirecto(
                  'no-show',
                  {},
                  '¿Marcar que el huésped no se presentó? El anticipo queda retenido.',
                )
              }
            >
              Marcar no-show
            </button>
          </>
        )}
        {['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado) && (
          <button type="button" className="boton" onClick={cancelar}>
            Cancelar reserva
          </button>
        )}
        {reserva.estado === 'EN_CURSO' && (
          <>
            <button type="button" className="boton" onClick={() => setAccion('consumo')}>
              Cargar consumo de la tienda
            </button>
            <button type="button" className="boton boton-primario" onClick={hacerCheckout}>
              Hacer check-out
            </button>
          </>
        )}
      </div>

      <div className="columnas-detalle">
        <section className="tarjeta">
          <h2 className="subtitulo">Habitaciones</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Habitación</th>
                <th>Tipo</th>
                <th>Noches</th>
                <th className="celda-numero">Valor</th>
              </tr>
            </thead>
            <tbody>
              {reserva.habitaciones.map((linea) => (
                <tr key={linea.id}>
                  <td>{linea.habitacion.numero}</td>
                  <td>{linea.habitacion.tipo.nombre}</td>
                  <td>{linea.noches}</td>
                  <td className="celda-numero">{formatearPesos(linea.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reserva.observaciones && <p className="texto-suave">{reserva.observaciones}</p>}
        </section>

        <section className="tarjeta">
          <h2 className="subtitulo">Cuenta</h2>
          <dl className="totales">
            <dt>Habitaciones</dt>
            <dd>{formatearPesos(resumen.totalHabitaciones)}</dd>
            {resumen.descuento > 0 && (
              <>
                <dt>Descuento ({reserva.descuentoPorcentaje} %)</dt>
                <dd>−{formatearPesos(resumen.descuento)}</dd>
              </>
            )}
            <dt>Total estadía</dt>
            <dd>
              <strong>{formatearPesos(resumen.totalEstadia)}</strong>
            </dd>
            <dt>Pagado</dt>
            <dd>{formatearPesos(resumen.pagadoEstadia)}</dd>
            <dt>Saldo de la estadía</dt>
            <dd>{formatearPesos(resumen.saldoEstadia)}</dd>
            <dt>Consumos por pagar</dt>
            <dd>{formatearPesos(resumen.consumosPendientes)}</dd>
          </dl>
        </section>
      </div>

      {reserva.consumos.length > 0 && (
        <>
          <h2 className="subtitulo">Consumos de la tienda</h2>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th className="celda-numero">Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reserva.consumos.map((consumo) => (
                  <tr key={consumo.id}>
                    <td>{formatearFechaHora(consumo.creadoEn)}</td>
                    <td>{consumo.producto.nombre}</td>
                    <td>{consumo.cantidad}</td>
                    <td className="celda-numero">
                      {formatearPesos(consumo.cantidad * consumo.precioUnitario)}
                    </td>
                    <td>{consumo.pagado ? 'Pagado' : 'En la cuenta'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {reserva.ventas.length > 0 && (
        <>
          <h2 className="subtitulo">Cobros</h2>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Pago</th>
                  <th className="celda-numero">Valor</th>
                </tr>
              </thead>
              <tbody>
                {reserva.ventas.map((venta) => (
                  <tr key={venta.id} className={venta.estado === 'ANULADA' ? 'fila-anulada' : ''}>
                    <td>N.º {String(venta.id).padStart(5, '0')}</td>
                    <td>{formatearFechaHora(venta.creadoEn)}</td>
                    <td>
                      {TIPOS_COBRO[venta.tipo]}
                      {venta.estado === 'ANULADA' && ' (devuelto)'}
                    </td>
                    <td>{venta.pagos.map((pago) => METODOS_PAGO[pago.metodo]).join(' + ')}</td>
                    <td className="celda-numero">{formatearPesos(venta.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {accion === 'anticipo' && (
        <Modal titulo="Registrar anticipo" onCerrar={() => setAccion(null)}>
          <FormularioPagos
            monto={resumen.anticipoRequerido}
            textoBoton="Confirmar reserva"
            onConfirmar={(pagos) => ejecutar('anticipo', { pagos })}
            onCancelar={() => setAccion(null)}
          />
        </Modal>
      )}

      {accion === 'checkin' && (
        <Modal titulo="Check-in: saldo de la estadía" onCerrar={() => setAccion(null)}>
          <FormularioPagos
            monto={resumen.saldoEstadia}
            textoBoton="Cobrar y hacer check-in"
            onConfirmar={(pagos) => ejecutar('checkin', { pagos })}
            onCancelar={() => setAccion(null)}
          />
        </Modal>
      )}

      {accion === 'checkout' && (
        <Modal titulo="Check-out: consumos de la tienda" onCerrar={() => setAccion(null)}>
          <FormularioPagos
            monto={resumen.consumosPendientes}
            textoBoton="Cobrar y hacer check-out"
            onConfirmar={async (pagos) => {
              await ejecutar('checkout', { pagos });
              setAviso('Check-out registrado. Housekeeping ya recibió el aviso de limpieza.');
            }}
            onCancelar={() => setAccion(null)}
          />
        </Modal>
      )}

      {accion === 'consumo' && (
        <Modal titulo="Cargar consumo a la habitación" onCerrar={() => setAccion(null)}>
          <FormularioConsumo
            onGuardar={(datos) => ejecutar('consumos', datos)}
            onCancelar={() => setAccion(null)}
          />
        </Modal>
      )}
    </>
  );
}

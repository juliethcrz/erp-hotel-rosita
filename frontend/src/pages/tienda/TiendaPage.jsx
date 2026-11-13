import { Minus, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { FormularioPagos } from '../../components/FormularioPagos.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatearPesos } from '../../utils/formato.js';

export function TiendaPage() {
  const [productos, setProductos] = useState([]);
  const [hospedadas, setHospedadas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [comprador, setComprador] = useState('paso');
  const [reservaId, setReservaId] = useState('');
  const [conNombre, setConNombre] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cobrando, setCobrando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargar = () => {
    api.get('/inventario/productos').then(setProductos).catch(setError);
    api.get('/reservas?estado=EN_CURSO').then(setHospedadas).catch(setError);
  };

  useEffect(() => {
    api.get('/inventario/productos').then(setProductos).catch(setError);
    api.get('/reservas?estado=EN_CURSO').then(setHospedadas).catch(setError);
  }, []);

  const texto = busqueda.trim().toLowerCase();
  const visibles = productos.filter(
    (p) => !texto || p.nombre.toLowerCase().includes(texto) || p.codigo.includes(texto),
  );
  const categorias = [...new Set(visibles.map((p) => p.categoria.nombre))];

  const enCarrito = (productoId) => carrito.find((item) => item.producto.id === productoId);

  const agregar = (producto) => {
    const item = enCarrito(producto.id);
    if (item && item.cantidad >= producto.stockActual) return;
    setCarrito(
      item
        ? carrito.map((i) =>
            i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i,
          )
        : [...carrito, { producto, cantidad: 1 }],
    );
  };

  const cambiarCantidad = (productoId, delta) => {
    setCarrito(
      carrito
        .map((i) =>
          i.producto.id === productoId
            ? { ...i, cantidad: Math.min(i.cantidad + delta, i.producto.stockActual) }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    );
  };

  const total = carrito.reduce((suma, i) => suma + i.cantidad * i.producto.precioVenta, 0);
  const items = carrito.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad }));

  const terminar = (mensaje) => {
    setCarrito([]);
    setNombre('');
    setConNombre(false);
    setCobrando(false);
    setAviso(mensaje);
    cargar();
  };

  const cobrar = async (pagos) => {
    const compradorNombre = conNombre && nombre.trim() ? nombre.trim() : null;
    const venta = await api.post('/tienda/ventas', { items, pagos, compradorNombre });
    terminar(`Venta registrada. Comprobante N.º ${String(venta.id).padStart(5, '0')}.`);
  };

  const cargarAHabitacion = async () => {
    setProcesando(true);
    setError(null);
    try {
      const reserva = await api.post(`/reservas/${reservaId}/consumos`, { items });
      const numeros = reserva.habitaciones.map((h) => h.habitacion.numero).join(', ');
      terminar(`Cargado a la cuenta de la habitación ${numeros} (${reserva.codigo}).`);
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <EncabezadoPagina
        titulo="Tienda"
        descripcion="Productos empacados para huéspedes y visitantes"
      />
      {aviso && <div className="alerta alerta-exito">{aviso}</div>}
      <MensajeError error={!cobrando ? error : null} />

      <div className="tienda">
        <section>
          <label className="buscador">
            <Search size={16} />
            <input
              type="search"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>

          {categorias.map((categoria) => (
            <div key={categoria} className="grupo-productos">
              <h2 className="subtitulo">{categoria}</h2>
              <div className="productos">
                {visibles
                  .filter((p) => p.categoria.nombre === categoria)
                  .map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      className="producto"
                      disabled={producto.stockActual === 0}
                      onClick={() => {
                        setAviso(null);
                        agregar(producto);
                      }}
                    >
                      <strong>{producto.nombre}</strong>
                      <span>{formatearPesos(producto.precioVenta)}</span>
                      <small className={producto.stockBajo ? 'texto-aviso' : ''}>
                        {producto.stockActual === 0 ? 'Agotado' : `Quedan ${producto.stockActual}`}
                      </small>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="tarjeta carrito">
          <h2 className="subtitulo">Venta actual</h2>

          {carrito.length === 0 && <p className="texto-suave">Toque un producto para agregarlo.</p>}

          <ul className="lineas-carrito">
            {carrito.map(({ producto, cantidad }) => (
              <li key={producto.id}>
                <div>
                  <strong>{producto.nombre}</strong>
                  <small>{formatearPesos(producto.precioVenta * cantidad)}</small>
                </div>
                <div className="cantidad">
                  <button
                    type="button"
                    className="boton-icono"
                    onClick={() => cambiarCantidad(producto.id, -1)}
                    aria-label="Quitar una unidad"
                  >
                    {cantidad === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span>{cantidad}</span>
                  <button
                    type="button"
                    className="boton-icono"
                    onClick={() => cambiarCantidad(producto.id, 1)}
                    aria-label="Agregar una unidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="monto-cobro">
            Total <strong>{formatearPesos(total)}</strong>
          </p>

          <div className="segmentos" role="group" aria-label="¿Quién compra?">
            <button
              type="button"
              className={comprador === 'paso' ? 'activo' : ''}
              onClick={() => setComprador('paso')}
            >
              Persona de paso
            </button>
            <button
              type="button"
              className={comprador === 'huesped' ? 'activo' : ''}
              onClick={() => setComprador('huesped')}
            >
              Huésped hospedado
            </button>
          </div>

          {comprador === 'paso' && (
            <>
              <div className="opciones-nombre">
                <label>
                  <input
                    type="radio"
                    name="nombre-comprador"
                    checked={!conNombre}
                    onChange={() => setConNombre(false)}
                  />
                  No aplica
                </label>
                <label>
                  <input
                    type="radio"
                    name="nombre-comprador"
                    checked={conNombre}
                    onChange={() => setConNombre(true)}
                  />
                  Registrar nombre
                </label>
              </div>
              {conNombre && (
                <label className="campo">
                  <span>Nombre del comprador</span>
                  <input
                    value={nombre}
                    maxLength={100}
                    onChange={(evento) => setNombre(evento.target.value)}
                    autoFocus
                  />
                </label>
              )}
              <button
                type="button"
                className="boton boton-primario boton-ancho"
                disabled={carrito.length === 0 || (conNombre && !nombre.trim())}
                onClick={() => setCobrando(true)}
              >
                Cobrar {formatearPesos(total)}
              </button>
            </>
          )}

          {comprador === 'huesped' && (
            <>
              {hospedadas.length === 0 ? (
                <p className="texto-suave">No hay huéspedes hospedados en este momento.</p>
              ) : (
                <label className="campo">
                  <span>Habitación</span>
                  <select
                    value={reservaId}
                    onChange={(evento) => setReservaId(evento.target.value)}
                  >
                    <option value="">Seleccione la habitación…</option>
                    {hospedadas.map((reserva) => (
                      <option key={reserva.id} value={reserva.id}>
                        {reserva.habitaciones.map((h) => h.habitacion.numero).join(', ')} ·{' '}
                        {reserva.titular.nombres} {reserva.titular.apellidos}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                className="boton boton-primario boton-ancho"
                disabled={carrito.length === 0 || !reservaId || procesando}
                onClick={cargarAHabitacion}
              >
                Cargar a la cuenta de la habitación
              </button>
            </>
          )}
        </aside>
      </div>

      {cobrando && (
        <Modal titulo="Cobrar venta" onCerrar={() => setCobrando(false)}>
          <FormularioPagos
            monto={total}
            textoBoton="Registrar venta"
            onConfirmar={cobrar}
            onCancelar={() => setCobrando(false)}
          />
        </Modal>
      )}
    </>
  );
}

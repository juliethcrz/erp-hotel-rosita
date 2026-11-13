import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Boton, Campo, Pestanas } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import estilos from './Carrito.module.css';

const OPCIONES_COMPRADOR = [
  { valor: 'paso', etiqueta: 'Persona de paso' },
  { valor: 'huesped', etiqueta: 'Huésped' },
];

/**
 * Resumen de la venta en curso y elección de quién compra. La decisión de qué
 * hacer al confirmar la toma la página a través de `onCobrar` y `onCargar`.
 */
export function Carrito({ carrito, comprador, hospedadas, procesando, onCobrar, onCargar }) {
  const { lineas, total, cambiarCantidad } = carrito;
  const { tipo, setTipo, reservaId, setReservaId, conNombre, setConNombre, nombre, setNombre } =
    comprador;
  const vacio = lineas.length === 0;

  return (
    <aside className={estilos.carrito}>
      <header className={estilos.encabezado}>
        <ShoppingBag size={18} aria-hidden="true" />
        <h2>Venta actual</h2>
      </header>

      {vacio && <p className={estilos.vacio}>Toca un producto para agregarlo.</p>}

      <ul className={estilos.lineas}>
        {lineas.map(({ producto, cantidad }) => (
          <li key={producto.id}>
            <div className={estilos.detalle}>
              <strong>{producto.nombre}</strong>
              <small>{formatearPesos(producto.precioVenta * cantidad)}</small>
            </div>
            <div className={estilos.cantidad}>
              <button
                type="button"
                onClick={() => cambiarCantidad(producto.id, -1)}
                aria-label="Quitar una unidad"
              >
                {cantidad === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
              </button>
              <span>{cantidad}</span>
              <button
                type="button"
                onClick={() => cambiarCantidad(producto.id, 1)}
                aria-label="Agregar una unidad"
              >
                <Plus size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={estilos.total}>
        <span>Total</span>
        <strong>{formatearPesos(total)}</strong>
      </div>

      <Pestanas
        etiqueta="¿Quién compra?"
        opciones={OPCIONES_COMPRADOR}
        valor={tipo}
        onCambiar={setTipo}
        ancho
      />

      {tipo === 'paso' && (
        <>
          <div className={estilos.opciones}>
            <label>
              <input type="radio" checked={!conNombre} onChange={() => setConNombre(false)} />
              No aplica
            </label>
            <label>
              <input type="radio" checked={conNombre} onChange={() => setConNombre(true)} />
              Registrar nombre
            </label>
          </div>
          {conNombre && (
            <Campo etiqueta="Nombre del comprador">
              <input value={nombre} maxLength={100} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
          )}
          <Boton
            variante="primario"
            ancho
            disabled={vacio || (conNombre && !nombre.trim())}
            onClick={onCobrar}
          >
            Cobrar {formatearPesos(total)}
          </Boton>
        </>
      )}

      {tipo === 'huesped' && (
        <>
          {hospedadas.length === 0 ? (
            <p className={estilos.vacio}>No hay huéspedes hospedados en este momento.</p>
          ) : (
            <Campo etiqueta="Habitación">
              <select value={reservaId} onChange={(e) => setReservaId(e.target.value)}>
                <option value="">Selecciona la habitación…</option>
                {hospedadas.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>
                    {reserva.habitaciones.map((h) => h.habitacion.numero).join(', ')} ·{' '}
                    {reserva.titular.nombres} {reserva.titular.apellidos}
                  </option>
                ))}
              </select>
            </Campo>
          )}
          <Boton
            variante="primario"
            ancho
            disabled={vacio || !reservaId || procesando}
            onClick={onCargar}
          >
            Cargar a la cuenta de la habitación
          </Boton>
        </>
      )}
    </aside>
  );
}

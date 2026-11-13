import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { MensajeError } from '../../components/MensajeError.jsx';
import { formatearPesos } from '../../utils/formato.js';

const LINEA_VACIA = { productoId: '', cantidad: 1, costoUnitario: '' };

export function CompraForm({ productos, onGuardar, onCancelar }) {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState('');
  const [lineas, setLineas] = useState([LINEA_VACIA]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.get('/inventario/proveedores').then(setProveedores).catch(setError);
  }, []);

  const actualizarLinea = (indice, campo, valor) => {
    setLineas(
      lineas.map((linea, i) => {
        if (i !== indice) return linea;
        const nueva = { ...linea, [campo]: valor };
        if (campo === 'productoId' && !linea.costoUnitario) {
          nueva.costoUnitario = productos.find((p) => p.id === Number(valor))?.costo ?? '';
        }
        return nueva;
      }),
    );
  };

  const total = lineas.reduce(
    (suma, linea) => suma + (Number(linea.cantidad) || 0) * (Number(linea.costoUnitario) || 0),
    0,
  );

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        proveedorId: Number(proveedorId),
        detalles: lineas.map((linea) => ({
          productoId: Number(linea.productoId),
          cantidad: Number(linea.cantidad),
          costoUnitario: Number(linea.costoUnitario),
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

      <label className="campo">
        <span>Proveedor *</span>
        <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required>
          <option value="">Seleccione…</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </label>

      <div className="lineas-compra">
        <div className="fila-compra encabezado">
          <span>Producto</span>
          <span>Cantidad</span>
          <span>Costo unitario</span>
          <span />
        </div>
        {lineas.map((linea, indice) => (
          <div key={indice} className="fila-compra">
            <select
              value={linea.productoId}
              onChange={(e) => actualizarLinea(indice, 'productoId', e.target.value)}
              aria-label="Producto"
              required
            >
              <option value="">Seleccione…</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={linea.cantidad}
              onChange={(e) => actualizarLinea(indice, 'cantidad', e.target.value)}
              aria-label="Cantidad"
              required
            />
            <input
              type="number"
              min={1}
              value={linea.costoUnitario}
              onChange={(e) => actualizarLinea(indice, 'costoUnitario', e.target.value)}
              aria-label="Costo unitario"
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
        ))}
      </div>

      <button
        type="button"
        className="boton boton-pequeno boton-texto"
        onClick={() => setLineas([...lineas, LINEA_VACIA])}
      >
        <Plus size={14} /> Agregar producto
      </button>

      <p className="monto-cobro">
        Total de la compra <strong>{formatearPesos(total)}</strong>
      </p>

      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          Registrar compra
        </button>
      </div>
    </form>
  );
}

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertaError, Boton, Campo, PieFormulario } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { inventarioApi } from '../../api/inventarioApi.js';
import estilos from './CompraForm.module.css';

const LINEA_VACIA = { productoId: '', cantidad: 1, costoUnitario: '' };

export function CompraForm({ productos, onGuardar, onCancelar }) {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState('');
  const [lineas, setLineas] = useState([LINEA_VACIA]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    inventarioApi.proveedores().then(setProveedores).catch(setError);
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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      <Campo etiqueta="Proveedor *">
        <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required>
          <option value="">Selecciona…</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id} value={proveedor.id}>
              {proveedor.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <div className={estilos.lineas}>
        <div className={`${estilos.fila} ${estilos.encabezado}`}>
          <span>Producto</span>
          <span>Cantidad</span>
          <span>Costo unitario</span>
          <span />
        </div>
        {lineas.map((linea, indice) => (
          <div key={indice} className={estilos.fila}>
            <select
              value={linea.productoId}
              onChange={(e) => actualizarLinea(indice, 'productoId', e.target.value)}
              aria-label="Producto"
              required
            >
              <option value="">Selecciona…</option>
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
              <Boton
                variante="fantasma"
                tamano="sm"
                icono={Trash2}
                aria-label="Quitar producto"
                onClick={() => setLineas(lineas.filter((_, i) => i !== indice))}
              />
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>

      <Boton
        variante="fantasma"
        tamano="sm"
        icono={Plus}
        className={estilos.agregar}
        onClick={() => setLineas([...lineas, LINEA_VACIA])}
      >
        Agregar producto
      </Boton>

      <div className={estilos.total}>
        <span>Total de la compra</span>
        <strong>{formatearPesos(total)}</strong>
      </div>

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          Registrar compra
        </Boton>
      </PieFormulario>
    </form>
  );
}

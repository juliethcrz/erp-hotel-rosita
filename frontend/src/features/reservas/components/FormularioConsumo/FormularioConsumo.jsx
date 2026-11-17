import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertaError, Boton, PieFormulario } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { inventarioApi } from '../../../inventario/api/inventarioApi.js';
import estilos from './FormularioConsumo.module.css';

const LINEA_VACIA = { productoId: '', cantidad: 1 };

/** Carga uno o varios productos de la tienda a la cuenta de la habitación. */
export function FormularioConsumo({ onGuardar, onCancelar }) {
  const [productos, setProductos] = useState([]);
  const [lineas, setLineas] = useState([LINEA_VACIA]);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    inventarioApi.productos().then(setProductos).catch(setError);
  }, []);

  const buscar = (productoId) => productos.find((p) => p.id === Number(productoId));
  const elegidos = lineas.map((linea) => linea.productoId).filter(Boolean);
  const total = lineas.reduce(
    (suma, linea) =>
      suma + (buscar(linea.productoId)?.precioVenta ?? 0) * Number(linea.cantidad || 0),
    0,
  );

  const actualizar = (indice, campo, valor) => {
    setLineas(lineas.map((linea, i) => (i === indice ? { ...linea, [campo]: valor } : linea)));
  };

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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      {lineas.map((linea, indice) => {
        const producto = buscar(linea.productoId);
        return (
          <div key={indice} className={estilos.fila}>
            <select
              value={linea.productoId}
              onChange={(e) => actualizar(indice, 'productoId', e.target.value)}
              aria-label="Producto"
              required
            >
              <option value="">Selecciona un producto…</option>
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
        );
      })}

      <Boton
        variante="fantasma"
        tamano="sm"
        icono={Plus}
        className={estilos.agregar}
        onClick={() => setLineas([...lineas, LINEA_VACIA])}
      >
        Agregar otro producto
      </Boton>

      <div className={estilos.total}>
        <span>Se cargará a la habitación</span>
        <strong>{formatearPesos(total)}</strong>
      </div>

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          Cargar a la cuenta
        </Boton>
      </PieFormulario>
    </form>
  );
}

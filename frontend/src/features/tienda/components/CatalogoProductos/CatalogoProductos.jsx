import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Buscador, Pestanas } from '../../../../components/ui/index.js';
import { cx } from '../../../../lib/clases.js';
import { formatearPesos } from '../../../../lib/formato.js';
import estilos from './CatalogoProductos.module.css';

const TODAS = 'todas';

export function CatalogoProductos({ productos, onAgregar }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(TODAS);

  const categorias = [...new Set(productos.map((p) => p.categoria.nombre))];
  const texto = busqueda.trim().toLowerCase();
  const visibles = productos.filter(
    (p) =>
      (categoria === TODAS || p.categoria.nombre === categoria) &&
      (!texto || p.nombre.toLowerCase().includes(texto)),
  );

  return (
    <section className={estilos.catalogo}>
      <Buscador valor={busqueda} onCambiar={setBusqueda} placeholder="Buscar producto" />
      <div className={estilos.categorias}>
        <Pestanas
          etiqueta="Categorías"
          valor={categoria}
          onCambiar={setCategoria}
          opciones={[
            { valor: TODAS, etiqueta: 'Todas' },
            ...categorias.map((nombre) => ({ valor: nombre, etiqueta: nombre })),
          ]}
        />
      </div>

      <div className={estilos.rejilla}>
        {visibles.map((producto) => (
          <button
            key={producto.id}
            type="button"
            className={estilos.producto}
            disabled={producto.stockActual === 0}
            onClick={() => onAgregar(producto)}
          >
            <span className={estilos.categoria}>{producto.categoria.nombre}</span>
            <strong>{producto.nombre}</strong>
            <span className={estilos.precio}>{formatearPesos(producto.precioVenta)}</span>
            <span className={cx(estilos.stock, producto.stockBajo && estilos.stockBajo)}>
              {producto.stockActual === 0 ? 'Agotado' : `Quedan ${producto.stockActual}`}
            </span>
            <span className={estilos.agregar} aria-hidden="true">
              <Plus size={16} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

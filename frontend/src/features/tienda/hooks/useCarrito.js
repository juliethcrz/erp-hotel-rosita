import { useState } from 'react';

/** Carrito de la tienda: nunca permite más unidades que el stock disponible. */
export function useCarrito() {
  const [lineas, setLineas] = useState([]);

  const agregar = (producto) => {
    setLineas((actuales) => {
      const linea = actuales.find((l) => l.producto.id === producto.id);
      if (!linea) return [...actuales, { producto, cantidad: 1 }];
      if (linea.cantidad >= producto.stockActual) return actuales;
      return actuales.map((l) => (l === linea ? { ...l, cantidad: l.cantidad + 1 } : l));
    });
  };

  const cambiarCantidad = (productoId, delta) => {
    setLineas((actuales) =>
      actuales
        .map((l) =>
          l.producto.id === productoId
            ? { ...l, cantidad: Math.min(l.cantidad + delta, l.producto.stockActual) }
            : l,
        )
        .filter((l) => l.cantidad > 0),
    );
  };

  const total = lineas.reduce((suma, l) => suma + l.cantidad * l.producto.precioVenta, 0);
  const items = lineas.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad }));

  return { lineas, total, items, agregar, cambiarCantidad, vaciar: () => setLineas([]) };
}

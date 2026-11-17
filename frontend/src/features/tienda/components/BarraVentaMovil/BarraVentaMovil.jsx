import { ShoppingBag } from 'lucide-react';
import { formatearPesos } from '../../../../lib/formato.js';
import estilos from './BarraVentaMovil.module.css';

/**
 * En pantallas angostas el carrito queda debajo del catálogo; esta barra fija
 * muestra el total y lleva hasta él.
 */
export function BarraVentaMovil({ unidades, total, idCarrito }) {
  if (unidades === 0) return null;

  const irAlCarrito = () =>
    document.getElementById(idCarrito)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <button type="button" className={estilos.barra} onClick={irAlCarrito}>
      <span className={estilos.cantidad}>
        <ShoppingBag size={18} aria-hidden="true" />
        {unidades} {unidades === 1 ? 'producto' : 'productos'}
      </span>
      <strong>Ver venta · {formatearPesos(total)}</strong>
    </button>
  );
}

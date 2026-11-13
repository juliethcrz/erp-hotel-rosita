import { Boton, Insignia, Tarjeta } from '../../../../components/ui/index.js';
import estilos from './AlertaStock.module.css';

export function AlertaStock({ productos }) {
  return (
    <Tarjeta
      titulo="Stock bajo"
      acciones={
        <Boton tamano="sm" to="/inventario">
          Inventario
        </Boton>
      }
    >
      {productos.length === 0 ? (
        <p className={estilos.vacio}>Todos los productos están por encima del mínimo.</p>
      ) : (
        <ul className={estilos.lista}>
          {productos.map((producto) => (
            <li key={producto.id}>
              <span>{producto.nombre}</span>
              <Insignia tono={producto.stockActual === 0 ? 'peligro' : 'aviso'}>
                {producto.stockActual} / mín. {producto.stockMinimo}
              </Insignia>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  );
}

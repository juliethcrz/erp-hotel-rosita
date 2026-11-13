import { cx } from '../../../lib/clases.js';
import estilos from './Tabla.module.css';

/**
 * Tabla declarativa: cada columna define su título y cómo se muestra su celda.
 * En pantallas pequeñas cada fila se presenta como una tarjeta.
 */
export function Tabla({ columnas, filas, claveFila = 'id', vacio = 'Sin registros.', claseFila }) {
  return (
    <div className={estilos.contenedor}>
      <table className={estilos.tabla}>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} className={cx(columna.numero && estilos.numero)}>
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[claveFila]} className={claseFila?.(fila)}>
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  data-titulo={columna.titulo}
                  className={cx(
                    columna.numero && estilos.numero,
                    columna.acciones && estilos.acciones,
                  )}
                >
                  {columna.render ? columna.render(fila) : fila[columna.clave]}
                </td>
              ))}
            </tr>
          ))}
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas.length} className={estilos.vacia}>
                {vacio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cx } from '../../../lib/clases.js';
import estilos from './Tabla.module.css';

const FILAS_POR_PAGINA = 20;

/**
 * Tabla declarativa: cada columna define su título y cómo se muestra su celda.
 * Pagina sola cuando hay muchas filas y en pantallas pequeñas cada fila se
 * presenta como una tarjeta.
 */
export function Tabla({
  columnas,
  filas,
  claveFila = 'id',
  vacio = 'Sin registros.',
  claseFila,
  porPagina = FILAS_POR_PAGINA,
}) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(filas.length / porPagina));
  const actual = Math.min(pagina, totalPaginas);
  const desde = (actual - 1) * porPagina;
  const visibles = filas.slice(desde, desde + porPagina);

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
          {visibles.map((fila) => (
            <tr key={fila[claveFila]} className={claseFila?.(fila)}>
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  data-titulo={columna.titulo}
                  className={cx(
                    columna.numero && estilos.numero,
                    columna.sinCorte && estilos.sinCorte,
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

      {totalPaginas > 1 && (
        <nav className={estilos.paginacion} aria-label="Paginación">
          <span>
            {desde + 1}–{desde + visibles.length} de {filas.length}
          </span>
          <div className={estilos.pasos}>
            <button
              type="button"
              onClick={() => setPagina(actual - 1)}
              disabled={actual === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Página {actual} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina(actual + 1)}
              disabled={actual === totalPaginas}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

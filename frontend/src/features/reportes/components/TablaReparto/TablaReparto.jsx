import estilos from './TablaReparto.module.css';

/** Lista de partes de un total con su barra de participación. */
export function TablaReparto({ filas, formatear, vacio = 'Sin movimientos en el periodo.' }) {
  const total = filas.reduce((suma, fila) => suma + fila.valor, 0);
  const visibles = filas.filter((fila) => fila.valor !== 0);

  if (visibles.length === 0) return <p className={estilos.vacio}>{vacio}</p>;

  return (
    <ul className={estilos.lista}>
      {visibles.map((fila) => {
        const parte = total ? Math.round((fila.valor / total) * 1000) / 10 : 0;
        return (
          <li key={fila.etiqueta}>
            <div className={estilos.fila}>
              <span>{fila.etiqueta}</span>
              <strong>{formatear(fila.valor)}</strong>
            </div>
            <div className={estilos.pista}>
              <div className={estilos.relleno} style={{ width: `${Math.max(parte, 0)}%` }} />
            </div>
            <small>{parte.toLocaleString('es-CO')} %</small>
          </li>
        );
      })}
    </ul>
  );
}

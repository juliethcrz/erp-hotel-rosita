import estilos from './GraficoBarras.module.css';

const dia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', timeZone: 'UTC' });
const mes = new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' });
const corta = { format: (fecha) => `${dia.format(fecha)} ${mes.format(fecha).replace('.', '')}` };

/** Barras verticales por día; el valor exacto aparece al pasar el cursor. */
export function GraficoBarras({ datos, formatear, maximo }) {
  const tope = maximo ?? Math.max(...datos.map((d) => d.valor), 1);
  const cadaCuanto = Math.ceil(datos.length / 7);

  return (
    <div className={estilos.contenedor}>
      <div className={estilos.grafico} style={{ '--columnas': datos.length }}>
        {datos.map((dato, indice) => {
          const fecha = corta.format(new Date(`${dato.fecha}T00:00:00Z`));
          return (
            <div key={dato.fecha} className={estilos.columna}>
              <div
                className={estilos.barra}
                style={{ height: `${Math.max((dato.valor / tope) * 100, dato.valor ? 2 : 0)}%` }}
                title={`${fecha}: ${formatear(dato.valor)}`}
              >
                <span className={estilos.valor}>{formatear(dato.valor)}</span>
              </div>
              <span className={estilos.etiqueta}>{indice % cadaCuanto === 0 ? fecha : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

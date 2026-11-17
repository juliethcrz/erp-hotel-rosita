import estilos from './EncabezadoPagina.module.css';

export function EncabezadoPagina({ titulo, descripcion, antetitulo, acciones }) {
  return (
    <header className={estilos.encabezado}>
      <div>
        {antetitulo && <p className={estilos.antetitulo}>{antetitulo}</p>}
        <h1>{titulo}</h1>
        {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
      </div>
      {acciones && <div className={estilos.acciones}>{acciones}</div>}
    </header>
  );
}

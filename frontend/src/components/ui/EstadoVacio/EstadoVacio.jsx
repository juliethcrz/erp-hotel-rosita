import estilos from './EstadoVacio.module.css';

export function EstadoVacio({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className={estilos.vacio}>
      {Icono && (
        <span className={estilos.icono}>
          <Icono size={26} aria-hidden="true" />
        </span>
      )}
      <h3>{titulo}</h3>
      {descripcion && <p>{descripcion}</p>}
      {accion}
    </div>
  );
}

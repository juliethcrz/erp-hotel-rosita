export function MensajeError({ error }) {
  if (!error) return null;

  return (
    <div className="alerta alerta-error" role="alert">
      <p>{error.message}</p>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((detalle) => (
            <li key={detalle.campo}>
              {detalle.campo}: {detalle.mensaje}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState } from 'react';
import { MensajeError } from '../../components/MensajeError.jsx';

export function RestablecerPasswordForm({ onGuardar, onCancelar }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(password);
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />
      <p className="texto-suave">
        El usuario deberá iniciar sesión de nuevo con la contraseña que defina aquí.
      </p>
      <label className="campo">
        <span>Nueva contraseña *</span>
        <input
          type="password"
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          required
        />
      </label>
      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Restablecer'}
        </button>
      </div>
    </form>
  );
}

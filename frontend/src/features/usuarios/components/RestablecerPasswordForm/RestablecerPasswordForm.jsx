import { useState } from 'react';
import { AlertaError, Boton, Campo, PieFormulario } from '../../../../components/ui/index.js';
import estilos from './RestablecerPasswordForm.module.css';

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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />
      <p className={estilos.ayuda}>
        El usuario deberá iniciar sesión de nuevo con la contraseña que definas aquí.
      </p>
      <Campo etiqueta="Nueva contraseña *" ayuda="Mínimo 8 caracteres.">
        <input
          type="password"
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          required
        />
      </Campo>
      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Restablecer'}
        </Boton>
      </PieFormulario>
    </form>
  );
}

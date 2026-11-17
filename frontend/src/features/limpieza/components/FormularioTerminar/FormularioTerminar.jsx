import { useState } from 'react';
import { AlertaError, Boton, Campo, PieFormulario } from '../../../../components/ui/index.js';
import estilos from './FormularioTerminar.module.css';

export function FormularioTerminar({ onConfirmar, onCancelar }) {
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar(observaciones.trim());
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  };

  return (
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />
      <Campo etiqueta="Observaciones (opcional)">
        <textarea
          rows={3}
          placeholder="El control del TV no funciona"
          value={observaciones}
          onChange={(evento) => setObservaciones(evento.target.value)}
        />
      </Campo>
      <p className={estilos.ayuda}>
        Recepción y el administrador recibirán el aviso de que la habitación está lista. Las
        observaciones le llegan al administrador.
      </p>
      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={enviando}>
          Confirmar
        </Boton>
      </PieFormulario>
    </form>
  );
}

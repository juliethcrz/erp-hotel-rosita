import { useState } from 'react';
import { AlertaError, Boton, Modal, PieFormulario } from '../../../../components/ui/index.js';
import estilos from './ConfirmarAccion.module.css';

/** Ventana de confirmación para acciones que no tienen vuelta atrás. */
export function ConfirmarAccion({
  titulo,
  mensaje,
  textoBoton,
  peligro = false,
  onConfirmar,
  onCerrar,
}) {
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar();
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={titulo} ancho="sm" onCerrar={onCerrar}>
      <AlertaError error={error} />
      <p className={estilos.mensaje}>{mensaje}</p>
      <PieFormulario>
        <Boton onClick={onCerrar}>Volver</Boton>
        <Boton variante={peligro ? 'peligro' : 'primario'} disabled={enviando} onClick={confirmar}>
          {textoBoton}
        </Boton>
      </PieFormulario>
    </Modal>
  );
}

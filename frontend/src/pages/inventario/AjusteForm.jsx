import { useState } from 'react';
import { MensajeError } from '../../components/MensajeError.jsx';

export function AjusteForm({ producto, onGuardar, onCancelar }) {
  const [tipo, setTipo] = useState('SALIDA');
  const [cantidad, setCantidad] = useState(1);
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    const signo = tipo === 'SALIDA' ? -1 : 1;
    try {
      await onGuardar({ cantidad: signo * Number(cantidad), observacion });
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />
      <p className="texto-suave">
        Stock actual: <strong>{producto.stockActual}</strong>. Use el ajuste para corregir
        diferencias del conteo físico, productos vencidos o dañados.
      </p>
      <div className="fila-campos">
        <label className="campo">
          <span>Tipo de ajuste</span>
          <select value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
            <option value="SALIDA">Salida (restar)</option>
            <option value="ENTRADA">Entrada (sumar)</option>
          </select>
        </label>
        <label className="campo">
          <span>Cantidad</span>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            required
          />
        </label>
      </div>
      <label className="campo">
        <span>Motivo *</span>
        <input
          placeholder="Por ejemplo: producto vencido"
          value={observacion}
          onChange={(evento) => setObservacion(evento.target.value)}
          required
        />
      </label>
      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          Registrar ajuste
        </button>
      </div>
    </form>
  );
}

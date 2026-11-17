import { useState } from 'react';
import {
  AlertaError,
  Boton,
  Campo,
  FilaCampos,
  PieFormulario,
} from '../../../../components/ui/index.js';
import estilos from './AjusteForm.module.css';

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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />
      <p className={estilos.ayuda}>
        Stock actual: <strong>{producto.stockActual}</strong>. Usa el ajuste para corregir
        diferencias del conteo físico, productos vencidos o dañados.
      </p>
      <FilaCampos>
        <Campo etiqueta="Tipo de ajuste">
          <select value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
            <option value="SALIDA">Salida (restar)</option>
            <option value="ENTRADA">Entrada (sumar)</option>
          </select>
        </Campo>
        <Campo etiqueta="Cantidad">
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            required
          />
        </Campo>
      </FilaCampos>
      <Campo etiqueta="Motivo *">
        <input
          placeholder="Producto vencido"
          value={observacion}
          onChange={(evento) => setObservacion(evento.target.value)}
          required
        />
      </Campo>
      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          Registrar ajuste
        </Boton>
      </PieFormulario>
    </form>
  );
}

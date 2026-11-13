import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { METODOS_PAGO } from '../constants/catalogos.js';
import { formatearPesos } from '../utils/formato.js';
import { MensajeError } from './MensajeError.jsx';

export function FormularioPagos({ monto, textoBoton, onConfirmar, onCancelar }) {
  const [pagos, setPagos] = useState([{ metodo: 'EFECTIVO', monto }]);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const suma = pagos.reduce((total, pago) => total + (Number(pago.monto) || 0), 0);
  const diferencia = monto - suma;

  const actualizar = (indice, campo, valor) => {
    setPagos(pagos.map((pago, i) => (i === indice ? { ...pago, [campo]: valor } : pago)));
  };

  const agregar = () => {
    setPagos([...pagos, { metodo: 'NEQUI', monto: Math.max(diferencia, 0) }]);
  };

  const quitar = (indice) => {
    setPagos(pagos.filter((_, i) => i !== indice));
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar(pagos.map((pago) => ({ metodo: pago.metodo, monto: Number(pago.monto) })));
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />

      <p className="monto-cobro">
        Valor a cobrar <strong>{formatearPesos(monto)}</strong>
      </p>

      {pagos.map((pago, indice) => (
        <div key={indice} className="fila-pago">
          <select
            value={pago.metodo}
            onChange={(evento) => actualizar(indice, 'metodo', evento.target.value)}
            aria-label="Método de pago"
          >
            {Object.entries(METODOS_PAGO).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            step={1}
            value={pago.monto}
            onChange={(evento) => actualizar(indice, 'monto', evento.target.value)}
            aria-label="Monto"
            required
          />
          {pagos.length > 1 && (
            <button
              type="button"
              className="boton-icono"
              onClick={() => quitar(indice)}
              aria-label="Quitar pago"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}

      <button type="button" className="boton boton-pequeno boton-texto" onClick={agregar}>
        <Plus size={14} /> Dividir entre otro método
      </button>

      {diferencia !== 0 && (
        <p className="texto-aviso">
          {diferencia > 0
            ? `Faltan ${formatearPesos(diferencia)} por asignar`
            : `Sobran ${formatearPesos(-diferencia)}`}
        </p>
      )}

      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="submit"
          className="boton boton-primario"
          disabled={enviando || diferencia !== 0}
        >
          {enviando ? 'Registrando…' : textoBoton}
        </button>
      </div>
    </form>
  );
}

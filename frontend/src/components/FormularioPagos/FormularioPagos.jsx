import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { METODOS_PAGO } from '../../constants/catalogos.js';
import { formatearPesos } from '../../lib/formato.js';
import { AlertaError, Boton, PieFormulario } from '../ui/index.js';
import estilos from './FormularioPagos.module.css';

/** Registra el pago de un valor exacto, dividido entre uno o varios métodos. */
export function FormularioPagos({ monto, textoBoton, onConfirmar, onCancelar }) {
  const [pagos, setPagos] = useState([{ metodo: 'EFECTIVO', monto }]);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const suma = pagos.reduce((total, pago) => total + (Number(pago.monto) || 0), 0);
  const diferencia = monto - suma;

  const actualizar = (indice, campo, valor) => {
    setPagos(pagos.map((pago, i) => (i === indice ? { ...pago, [campo]: valor } : pago)));
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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      <div className={estilos.monto}>
        <span>Valor a cobrar</span>
        <strong>{formatearPesos(monto)}</strong>
      </div>

      {pagos.map((pago, indice) => (
        <div key={indice} className={estilos.fila}>
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
          {pagos.length > 1 ? (
            <Boton
              variante="fantasma"
              tamano="sm"
              icono={Trash2}
              aria-label="Quitar pago"
              onClick={() => setPagos(pagos.filter((_, i) => i !== indice))}
            />
          ) : (
            <span />
          )}
        </div>
      ))}

      <Boton
        variante="fantasma"
        tamano="sm"
        icono={Plus}
        className={estilos.agregar}
        onClick={() => setPagos([...pagos, { metodo: 'NEQUI', monto: Math.max(diferencia, 0) }])}
      >
        Dividir entre otro método
      </Boton>

      {diferencia !== 0 && (
        <p className={estilos.diferencia}>
          {diferencia > 0
            ? `Faltan ${formatearPesos(diferencia)} por asignar`
            : `Sobran ${formatearPesos(-diferencia)}`}
        </p>
      )}

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={enviando || diferencia !== 0}>
          {enviando ? 'Registrando…' : textoBoton}
        </Boton>
      </PieFormulario>
    </form>
  );
}

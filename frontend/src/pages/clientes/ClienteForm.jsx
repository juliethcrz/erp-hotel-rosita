import { useState } from 'react';
import { MensajeError } from '../../components/MensajeError.jsx';
import { TIPOS_DOCUMENTO } from '../../constants/catalogos.js';

const VACIO = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  observaciones: '',
};

function aFormulario(cliente) {
  if (!cliente) return VACIO;
  return Object.fromEntries(
    Object.keys(VACIO).map((campo) => {
      const valor = cliente[campo] ?? '';
      return [campo, campo === 'fechaNacimiento' && valor ? valor.slice(0, 10) : valor];
    }),
  );
}

function aDatos(formulario) {
  return Object.fromEntries(
    Object.entries(formulario).map(([campo, valor]) => [campo, valor.trim() === '' ? null : valor]),
  );
}

export function ClienteForm({ cliente, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState(() => aFormulario(cliente));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const actualizar = (evento) => {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(aDatos(formulario));
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />

      <div className="fila-campos">
        <label className="campo">
          <span>Nombres *</span>
          <input name="nombres" value={formulario.nombres} onChange={actualizar} required />
        </label>
        <label className="campo">
          <span>Apellidos *</span>
          <input name="apellidos" value={formulario.apellidos} onChange={actualizar} required />
        </label>
      </div>

      <div className="fila-campos">
        <label className="campo">
          <span>Tipo de documento *</span>
          <select name="tipoDocumento" value={formulario.tipoDocumento} onChange={actualizar}>
            {Object.entries(TIPOS_DOCUMENTO).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Número de documento *</span>
          <input
            name="numeroDocumento"
            value={formulario.numeroDocumento}
            onChange={actualizar}
            required
          />
        </label>
      </div>

      <div className="fila-campos">
        <label className="campo">
          <span>Fecha de nacimiento</span>
          <input
            type="date"
            name="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={actualizar}
          />
        </label>
        <label className="campo">
          <span>Teléfono</span>
          <input type="tel" name="telefono" value={formulario.telefono} onChange={actualizar} />
        </label>
      </div>

      <label className="campo">
        <span>Correo electrónico</span>
        <input type="email" name="email" value={formulario.email} onChange={actualizar} />
      </label>

      <label className="campo">
        <span>Observaciones</span>
        <textarea
          name="observaciones"
          rows={3}
          value={formulario.observaciones}
          onChange={actualizar}
        />
      </label>

      <div className="acciones-modal">
        <button type="button" className="boton" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

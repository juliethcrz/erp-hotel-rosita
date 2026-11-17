import { useState } from 'react';
import {
  AlertaError,
  Boton,
  Campo,
  FilaCampos,
  PieFormulario,
} from '../../../../components/ui/index.js';
import { TIPOS_DOCUMENTO } from '../../../../constants/catalogos.js';
import estilos from './ClienteForm.module.css';

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
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      <FilaCampos>
        <Campo etiqueta="Nombres *">
          <input name="nombres" value={formulario.nombres} onChange={actualizar} required />
        </Campo>
        <Campo etiqueta="Apellidos *">
          <input name="apellidos" value={formulario.apellidos} onChange={actualizar} required />
        </Campo>
      </FilaCampos>

      <FilaCampos>
        <Campo etiqueta="Tipo de documento *">
          <select name="tipoDocumento" value={formulario.tipoDocumento} onChange={actualizar}>
            {Object.entries(TIPOS_DOCUMENTO).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Número de documento *">
          <input
            name="numeroDocumento"
            value={formulario.numeroDocumento}
            onChange={actualizar}
            required
          />
        </Campo>
      </FilaCampos>

      <FilaCampos>
        <Campo etiqueta="Fecha de nacimiento">
          <input
            type="date"
            name="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={actualizar}
          />
        </Campo>
        <Campo etiqueta="Teléfono">
          <input type="tel" name="telefono" value={formulario.telefono} onChange={actualizar} />
        </Campo>
      </FilaCampos>

      <Campo etiqueta="Correo electrónico">
        <input type="email" name="email" value={formulario.email} onChange={actualizar} />
      </Campo>

      <Campo etiqueta="Observaciones">
        <textarea
          name="observaciones"
          rows={3}
          value={formulario.observaciones}
          onChange={actualizar}
        />
      </Campo>

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Boton>
      </PieFormulario>
    </form>
  );
}

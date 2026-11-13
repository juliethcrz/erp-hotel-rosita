import { useState } from 'react';
import {
  AlertaError,
  Boton,
  Campo,
  FilaCampos,
  PieFormulario,
} from '../../../../components/ui/index.js';
import { ROLES } from '../../../../constants/catalogos.js';
import estilos from './UsuarioForm.module.css';

export function UsuarioForm({ usuario, onGuardar, onCancelar }) {
  const esNuevo = !usuario;
  const [formulario, setFormulario] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    email: usuario?.email ?? '',
    rol: usuario?.rol ?? 'RECEPCIONISTA',
    password: '',
  });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const actualizar = (evento) => {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError(null);
    const { password, ...datos } = formulario;
    try {
      await onGuardar(esNuevo ? { ...datos, password } : datos);
    } catch (err) {
      setError(err);
      setGuardando(false);
    }
  };

  return (
    <form className={estilos.formulario} onSubmit={enviar}>
      <AlertaError error={error} />

      <FilaCampos>
        <Campo etiqueta="Nombre *">
          <input name="nombre" value={formulario.nombre} onChange={actualizar} required />
        </Campo>
        <Campo etiqueta="Apellido *">
          <input name="apellido" value={formulario.apellido} onChange={actualizar} required />
        </Campo>
      </FilaCampos>

      <Campo etiqueta="Correo electrónico *">
        <input type="email" name="email" value={formulario.email} onChange={actualizar} required />
      </Campo>

      <Campo etiqueta="Rol *">
        <select name="rol" value={formulario.rol} onChange={actualizar}>
          {Object.entries(ROLES).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </Campo>

      {esNuevo && (
        <Campo etiqueta="Contraseña inicial *" ayuda="Mínimo 8 caracteres.">
          <input
            type="password"
            name="password"
            minLength={8}
            autoComplete="new-password"
            value={formulario.password}
            onChange={actualizar}
            required
          />
        </Campo>
      )}

      <PieFormulario>
        <Boton onClick={onCancelar}>Cancelar</Boton>
        <Boton type="submit" variante="primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Boton>
      </PieFormulario>
    </form>
  );
}

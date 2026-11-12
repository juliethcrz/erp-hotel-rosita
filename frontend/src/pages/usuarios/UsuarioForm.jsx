import { useState } from 'react';
import { MensajeError } from '../../components/MensajeError.jsx';
import { ROLES } from '../../constants/catalogos.js';

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
    <form className="formulario" onSubmit={enviar}>
      <MensajeError error={error} />

      <div className="fila-campos">
        <label className="campo">
          <span>Nombre *</span>
          <input name="nombre" value={formulario.nombre} onChange={actualizar} required />
        </label>
        <label className="campo">
          <span>Apellido *</span>
          <input name="apellido" value={formulario.apellido} onChange={actualizar} required />
        </label>
      </div>

      <label className="campo">
        <span>Correo electrónico *</span>
        <input type="email" name="email" value={formulario.email} onChange={actualizar} required />
      </label>

      <label className="campo">
        <span>Rol *</span>
        <select name="rol" value={formulario.rol} onChange={actualizar}>
          {Object.entries(ROLES).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </label>

      {esNuevo && (
        <label className="campo">
          <span>Contraseña inicial *</span>
          <input
            type="password"
            name="password"
            minLength={8}
            autoComplete="new-password"
            value={formulario.password}
            onChange={actualizar}
            required
          />
        </label>
      )}

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

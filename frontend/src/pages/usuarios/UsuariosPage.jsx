import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ROLES } from '../../constants/catalogos.js';
import { RestablecerPasswordForm } from './RestablecerPasswordForm.jsx';
import { UsuarioForm } from './UsuarioForm.jsx';

export function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setUsuarios(await api.get('/usuarios'));
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    api.get('/usuarios').then(setUsuarios).catch(setError);
  }, []);

  const cerrar = () => setModal(null);

  const guardar = async (datos) => {
    if (modal.usuario) {
      await api.patch(`/usuarios/${modal.usuario.id}`, datos);
    } else {
      await api.post('/usuarios', datos);
    }
    cerrar();
    await cargar();
  };

  const restablecer = async (password) => {
    await api.patch(`/usuarios/${modal.usuario.id}/password`, { password });
    cerrar();
  };

  const alternarActivo = async (usuario) => {
    setError(null);
    try {
      await api.patch(`/usuarios/${usuario.id}`, { activo: !usuario.activo });
      await cargar();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Personas con acceso al sistema"
        acciones={
          <button
            type="button"
            className="boton boton-primario"
            onClick={() => setModal({ tipo: 'usuario' })}
          >
            <Plus size={16} /> Nuevo usuario
          </button>
        }
      />

      <MensajeError error={error} />

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  {usuario.nombre} {usuario.apellido}
                </td>
                <td>{usuario.email}</td>
                <td>{ROLES[usuario.rol]}</td>
                <td>
                  <span
                    className={`etiqueta ${usuario.activo ? 'etiqueta-ok' : 'etiqueta-apagada'}`}
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="celda-acciones">
                  <button
                    type="button"
                    className="boton boton-pequeno"
                    onClick={() => setModal({ tipo: 'usuario', usuario })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="boton boton-pequeno"
                    onClick={() => setModal({ tipo: 'password', usuario })}
                  >
                    Contraseña
                  </button>
                  {usuario.id !== usuarioActual.id && (
                    <button
                      type="button"
                      className="boton boton-pequeno"
                      onClick={() => alternarActivo(usuario)}
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.tipo === 'usuario' && (
        <Modal titulo={modal.usuario ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={cerrar}>
          <UsuarioForm usuario={modal.usuario} onGuardar={guardar} onCancelar={cerrar} />
        </Modal>
      )}

      {modal?.tipo === 'password' && (
        <Modal titulo={`Restablecer contraseña de ${modal.usuario.nombre}`} onCerrar={cerrar}>
          <RestablecerPasswordForm onGuardar={restablecer} onCancelar={cerrar} />
        </Modal>
      )}
    </>
  );
}

import { KeyRound, Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertaError,
  Boton,
  EncabezadoPagina,
  Insignia,
  Modal,
  Tabla,
} from '../../../components/ui/index.js';
import { ROLES } from '../../../constants/catalogos.js';
import { useAuth } from '../../auth/AuthContext.js';
import { usuariosApi } from '../api/usuariosApi.js';
import { RestablecerPasswordForm } from '../components/RestablecerPasswordForm/RestablecerPasswordForm.jsx';
import { UsuarioForm } from '../components/UsuarioForm/UsuarioForm.jsx';

export function UsuariosPage() {
  const { usuario: actual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);

  const recargar = useCallback(() => usuariosApi.listar().then(setUsuarios).catch(setError), []);

  useEffect(() => {
    usuariosApi.listar().then(setUsuarios).catch(setError);
  }, []);

  const cerrar = () => setModal(null);

  const guardar = async (datos) => {
    if (modal.usuario) {
      await usuariosApi.actualizar(modal.usuario.id, datos);
    } else {
      await usuariosApi.crear(datos);
    }
    cerrar();
    await recargar();
  };

  const alternarActivo = async (usuario) => {
    setError(null);
    try {
      await usuariosApi.actualizar(usuario.id, { activo: !usuario.activo });
      await recargar();
    } catch (err) {
      setError(err);
    }
  };

  const columnas = [
    { clave: 'nombre', titulo: 'Nombre', render: (u) => `${u.nombre} ${u.apellido}` },
    { clave: 'email', titulo: 'Correo' },
    {
      clave: 'rol',
      titulo: 'Rol',
      render: (u) => <Insignia tono="marca">{ROLES[u.rol]}</Insignia>,
    },
    {
      clave: 'activo',
      titulo: 'Estado',
      render: (u) => (
        <Insignia tono={u.activo ? 'exito' : 'neutro'} punto>
          {u.activo ? 'Activo' : 'Inactivo'}
        </Insignia>
      ),
    },
    {
      clave: 'acciones',
      titulo: '',
      acciones: true,
      render: (u) => (
        <>
          <Boton
            tamano="sm"
            icono={Pencil}
            aria-label="Editar"
            onClick={() => setModal({ tipo: 'usuario', usuario: u })}
          />
          <Boton
            tamano="sm"
            icono={KeyRound}
            aria-label="Restablecer contraseña"
            onClick={() => setModal({ tipo: 'password', usuario: u })}
          />
          {u.id !== actual.id && (
            <Boton tamano="sm" onClick={() => alternarActivo(u)}>
              {u.activo ? 'Desactivar' : 'Activar'}
            </Boton>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <EncabezadoPagina
        antetitulo="Administración"
        titulo="Usuarios"
        descripcion="Personas con acceso al sistema."
        acciones={
          <Boton variante="primario" icono={Plus} onClick={() => setModal({ tipo: 'usuario' })}>
            Nuevo usuario
          </Boton>
        }
      />
      <AlertaError error={error} />
      <Tabla columnas={columnas} filas={usuarios} />

      {modal?.tipo === 'usuario' && (
        <Modal titulo={modal.usuario ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={cerrar}>
          <UsuarioForm usuario={modal.usuario} onGuardar={guardar} onCancelar={cerrar} />
        </Modal>
      )}

      {modal?.tipo === 'password' && (
        <Modal titulo={`Restablecer contraseña de ${modal.usuario.nombre}`} onCerrar={cerrar}>
          <RestablecerPasswordForm
            onGuardar={async (password) => {
              await usuariosApi.restablecerPassword(modal.usuario.id, password);
              cerrar();
            }}
            onCancelar={cerrar}
          />
        </Modal>
      )}
    </>
  );
}

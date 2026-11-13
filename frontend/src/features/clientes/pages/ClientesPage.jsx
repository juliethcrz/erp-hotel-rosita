import { Plus, Users } from 'lucide-react';
import { useState } from 'react';
import {
  AlertaError,
  Boton,
  Buscador,
  EncabezadoPagina,
  Modal,
  Tabla,
} from '../../../components/ui/index.js';
import { clientesApi } from '../api/clientesApi.js';
import { ClienteForm } from '../components/ClienteForm/ClienteForm.jsx';
import { useBusquedaClientes } from '../hooks/useBusquedaClientes.js';
import estilos from './ClientesPage.module.css';

export function ClientesPage() {
  const { texto, setTexto, clientes, error, recargar } = useBusquedaClientes();
  const [editando, setEditando] = useState(null);

  const guardar = async (datos) => {
    if (editando.id) {
      await clientesApi.actualizar(editando.id, datos);
    } else {
      await clientesApi.crear(datos);
    }
    setEditando(null);
    await recargar();
  };

  const columnas = [
    {
      clave: 'documento',
      titulo: 'Documento',
      render: (c) => `${c.tipoDocumento} ${c.numeroDocumento}`,
    },
    {
      clave: 'nombre',
      titulo: 'Nombre',
      render: (c) => (
        <span className={estilos.nombre}>
          <span className={estilos.avatar}>
            {c.nombres[0]}
            {c.apellidos[0]}
          </span>
          {c.nombres} {c.apellidos}
        </span>
      ),
    },
    { clave: 'telefono', titulo: 'Teléfono', render: (c) => c.telefono ?? '—' },
    { clave: 'email', titulo: 'Correo', render: (c) => c.email ?? '—' },
    {
      clave: 'acciones',
      titulo: '',
      acciones: true,
      render: (c) => (
        <Boton tamano="sm" onClick={() => setEditando(c)}>
          Editar
        </Boton>
      ),
    },
  ];

  return (
    <>
      <EncabezadoPagina
        antetitulo="Huéspedes"
        titulo="Clientes"
        descripcion="Titulares y acompañantes registrados."
        acciones={
          <Boton variante="primario" icono={Plus} onClick={() => setEditando({})}>
            Nuevo cliente
          </Boton>
        }
      />
      <AlertaError error={error} />

      <div className={estilos.filtros}>
        <Buscador valor={texto} onCambiar={setTexto} placeholder="Buscar por nombre o documento" />
      </div>

      <Tabla
        columnas={columnas}
        filas={clientes}
        vacio={
          <span className={estilos.vacio}>
            <Users size={18} aria-hidden="true" /> No hay clientes que coincidan con la búsqueda.
          </span>
        }
      />

      {editando && (
        <Modal
          titulo={editando.id ? 'Editar cliente' : 'Nuevo cliente'}
          onCerrar={() => setEditando(null)}
        >
          <ClienteForm
            cliente={editando.id ? editando : null}
            onGuardar={guardar}
            onCancelar={() => setEditando(null)}
          />
        </Modal>
      )}
    </>
  );
}

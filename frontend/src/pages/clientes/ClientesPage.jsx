import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ClienteForm } from './ClienteForm.jsx';

const ESPERA_BUSQUEDA_MS = 300;

export function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (texto) => {
    try {
      const parametros = texto ? `?buscar=${encodeURIComponent(texto)}` : '';
      setClientes(await api.get(`/clientes${parametros}`));
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => cargar(busqueda.trim()), ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(temporizador);
  }, [busqueda, cargar]);

  const guardar = async (datos) => {
    if (editando.id) {
      await api.patch(`/clientes/${editando.id}`, datos);
    } else {
      await api.post('/clientes', datos);
    }
    setEditando(null);
    await cargar(busqueda.trim());
  };

  return (
    <>
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Titulares y huéspedes registrados"
        acciones={
          <button type="button" className="boton boton-primario" onClick={() => setEditando({})}>
            <Plus size={16} /> Nuevo cliente
          </button>
        }
      />

      <MensajeError error={error} />

      <label className="buscador">
        <Search size={16} />
        <input
          type="search"
          placeholder="Buscar por nombre o documento"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </label>

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  {cliente.tipoDocumento} {cliente.numeroDocumento}
                </td>
                <td>
                  {cliente.nombres} {cliente.apellidos}
                </td>
                <td>{cliente.telefono ?? '—'}</td>
                <td>{cliente.email ?? '—'}</td>
                <td className="celda-acciones">
                  <button
                    type="button"
                    className="boton boton-pequeno"
                    onClick={() => setEditando(cliente)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="tabla-vacia">
                  No hay clientes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

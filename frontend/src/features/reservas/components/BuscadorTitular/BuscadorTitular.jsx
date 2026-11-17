import { CheckCircle2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Boton, Buscador, Modal } from '../../../../components/ui/index.js';
import { cx } from '../../../../lib/clases.js';
import { clientesApi } from '../../../clientes/api/clientesApi.js';
import { ClienteForm } from '../../../clientes/components/ClienteForm/ClienteForm.jsx';
import { useBusquedaClientes } from '../../../clientes/hooks/useBusquedaClientes.js';
import estilos from './BuscadorTitular.module.css';

export function BuscadorTitular({ titular, onSeleccionar }) {
  const { texto, setTexto, clientes, activa } = useBusquedaClientes({ minimo: 2 });
  const [creando, setCreando] = useState(false);

  const crear = async (datos) => {
    const cliente = await clientesApi.crear(datos);
    setCreando(false);
    onSeleccionar(cliente);
  };

  return (
    <>
      {titular && (
        <div className={estilos.seleccion}>
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <strong>
              {titular.nombres} {titular.apellidos}
            </strong>
            <span>
              {titular.tipoDocumento} {titular.numeroDocumento}
            </span>
          </div>
        </div>
      )}

      <div className={estilos.barra}>
        <Buscador
          valor={texto}
          onCambiar={setTexto}
          placeholder="Buscar cliente por nombre o documento"
        />
        <Boton icono={UserPlus} onClick={() => setCreando(true)}>
          Cliente nuevo
        </Boton>
      </div>

      {activa && (
        <ul className={estilos.resultados}>
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <button
                type="button"
                className={cx(estilos.opcion, titular?.id === cliente.id && estilos.elegida)}
                onClick={() => onSeleccionar(cliente)}
              >
                <span className={estilos.iniciales} aria-hidden="true">
                  {cliente.nombres[0]}
                  {cliente.apellidos[0]}
                </span>
                <span className={estilos.datos}>
                  <strong>
                    {cliente.nombres} {cliente.apellidos}
                  </strong>
                  <small>
                    {cliente.tipoDocumento} {cliente.numeroDocumento}
                  </small>
                </span>
              </button>
            </li>
          ))}
          {clientes.length === 0 && <li className={estilos.vacio}>Sin resultados.</li>}
        </ul>
      )}

      {creando && (
        <Modal titulo="Nuevo cliente" onCerrar={() => setCreando(false)}>
          <ClienteForm onGuardar={crear} onCancelar={() => setCreando(false)} />
        </Modal>
      )}
    </>
  );
}

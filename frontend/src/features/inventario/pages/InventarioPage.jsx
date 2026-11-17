import { PackagePlus, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  AlertaError,
  Boton,
  EncabezadoPagina,
  Modal,
  Pestanas,
} from '../../../components/ui/index.js';
import { useAuth } from '../../auth/AuthContext.js';
import { inventarioApi } from '../api/inventarioApi.js';
import { AjusteForm } from '../components/AjusteForm/AjusteForm.jsx';
import { CompraForm } from '../components/CompraForm/CompraForm.jsx';
import { HistorialMovimientos } from '../components/HistorialMovimientos/HistorialMovimientos.jsx';
import { ProductoForm } from '../components/ProductoForm/ProductoForm.jsx';
import { TablaCompras } from '../components/TablaCompras/TablaCompras.jsx';
import { TablaProductos } from '../components/TablaProductos/TablaProductos.jsx';
import { useInventario } from '../hooks/useInventario.js';
import estilos from './InventarioPage.module.css';

const PESTANAS = [
  { valor: 'productos', etiqueta: 'Productos' },
  { valor: 'stockBajo', etiqueta: 'Stock bajo' },
  { valor: 'compras', etiqueta: 'Compras' },
];

export function InventarioPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'ADMIN';
  const { productos, compras, error, recargar } = useInventario({ esAdmin });
  const [pestana, setPestana] = useState('productos');
  const [modal, setModal] = useState(null);

  const cerrar = () => setModal(null);
  const guardarYRecargar = async (peticion) => {
    await peticion();
    cerrar();
    recargar();
  };

  const activos = productos.filter((p) => p.activo);
  const conStockBajo = activos.filter((p) => p.stockBajo);
  const opciones = PESTANAS.map((opcion) =>
    opcion.valor === 'stockBajo'
      ? { ...opcion, etiqueta: `Stock bajo (${conStockBajo.length})` }
      : opcion,
  );

  return (
    <>
      <EncabezadoPagina
        antetitulo="Tienda del hotel"
        titulo="Inventario"
        descripcion="Productos, stock y compras al proveedor."
        acciones={
          <>
            <Boton icono={PackagePlus} onClick={() => setModal({ tipo: 'compra' })}>
              Registrar compra
            </Boton>
            {esAdmin && (
              <Boton
                variante="primario"
                icono={Plus}
                onClick={() => setModal({ tipo: 'producto' })}
              >
                Nuevo producto
              </Boton>
            )}
          </>
        }
      />
      <AlertaError error={error} />

      <div className={estilos.pestanas}>
        <Pestanas etiqueta="Secciones" opciones={opciones} valor={pestana} onCambiar={setPestana} />
      </div>

      {pestana !== 'compras' && (
        <TablaProductos
          productos={pestana === 'stockBajo' ? conStockBajo : productos}
          esAdmin={esAdmin}
          onAccion={(tipo, producto) => setModal({ tipo, producto })}
        />
      )}
      {pestana === 'compras' && <TablaCompras compras={compras} />}

      {modal?.tipo === 'producto' && (
        <Modal titulo={modal.producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={cerrar}>
          <ProductoForm
            producto={modal.producto}
            onGuardar={(datos) =>
              guardarYRecargar(() =>
                modal.producto
                  ? inventarioApi.actualizarProducto(modal.producto.id, datos)
                  : inventarioApi.crearProducto(datos),
              )
            }
            onCancelar={cerrar}
          />
          {modal.producto && (
            <Boton
              variante="fantasma"
              tamano="sm"
              className={estilos.alternar}
              onClick={() =>
                guardarYRecargar(() =>
                  inventarioApi.actualizarProducto(modal.producto.id, {
                    activo: !modal.producto.activo,
                  }),
                )
              }
            >
              {modal.producto.activo ? 'Desactivar producto' : 'Activar producto'}
            </Boton>
          )}
        </Modal>
      )}

      {modal?.tipo === 'ajuste' && (
        <Modal titulo={`Ajustar stock · ${modal.producto.nombre}`} onCerrar={cerrar}>
          <AjusteForm
            producto={modal.producto}
            onGuardar={(datos) =>
              guardarYRecargar(() => inventarioApi.ajustar(modal.producto.id, datos))
            }
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {modal?.tipo === 'movimientos' && (
        <Modal titulo={`Movimientos · ${modal.producto.nombre}`} ancho="lg" onCerrar={cerrar}>
          <HistorialMovimientos productoId={modal.producto.id} />
        </Modal>
      )}

      {modal?.tipo === 'compra' && (
        <Modal titulo="Registrar compra al proveedor" ancho="lg" onCerrar={cerrar}>
          <CompraForm
            productos={activos}
            onGuardar={(datos) => guardarYRecargar(() => inventarioApi.registrarCompra(datos))}
            onCancelar={cerrar}
          />
        </Modal>
      )}
    </>
  );
}

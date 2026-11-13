import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatearFechaHora, formatearPesos } from '../../utils/formato.js';
import { AjusteForm } from './AjusteForm.jsx';
import { CompraForm } from './CompraForm.jsx';
import { ProductoForm } from './ProductoForm.jsx';

const MOTIVOS = {
  COMPRA: 'Compra',
  VENTA: 'Venta en tienda',
  CONSUMO_HABITACION: 'Consumo de habitación',
  AJUSTE: 'Ajuste',
};

function Movimientos({ producto }) {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    api.get(`/inventario/productos/${producto.id}/movimientos`).then(setMovimientos);
  }, [producto.id]);

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo</th>
            <th className="celda-numero">Cantidad</th>
            <th className="celda-numero">Queda</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id} title={movimiento.observacion ?? ''}>
              <td>{formatearFechaHora(movimiento.creadoEn)}</td>
              <td>{MOTIVOS[movimiento.motivo]}</td>
              <td className={`celda-numero ${movimiento.cantidad < 0 ? 'texto-egreso' : ''}`}>
                {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
              </td>
              <td className="celda-numero">{movimiento.stockResultante}</td>
              <td>{movimiento.usuario.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InventarioPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'ADMIN';
  const [pestana, setPestana] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState(null);

  const consulta = esAdmin ? '/inventario/productos?todos=true' : '/inventario/productos';

  const cargar = useCallback(() => {
    api.get(consulta).then(setProductos).catch(setError);
    api.get('/inventario/compras').then(setCompras).catch(setError);
  }, [consulta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cerrar = () => setModal(null);

  const guardarYRecargar = async (peticion) => {
    await peticion();
    cerrar();
    cargar();
  };

  const visibles = soloStockBajo ? productos.filter((p) => p.stockBajo && p.activo) : productos;
  const conStockBajo = productos.filter((p) => p.stockBajo && p.activo).length;

  return (
    <>
      <EncabezadoPagina
        titulo="Inventario"
        descripcion="Productos de la tienda, stock y compras al proveedor"
        acciones={
          <>
            <button type="button" className="boton" onClick={() => setModal({ tipo: 'compra' })}>
              Registrar compra
            </button>
            {esAdmin && (
              <button
                type="button"
                className="boton boton-primario"
                onClick={() => setModal({ tipo: 'producto' })}
              >
                <Plus size={16} /> Nuevo producto
              </button>
            )}
          </>
        }
      />
      <MensajeError error={error} />

      <div className="pestanas">
        <button
          type="button"
          className={pestana === 'productos' ? 'activa' : ''}
          onClick={() => setPestana('productos')}
        >
          Productos
        </button>
        <button
          type="button"
          className={pestana === 'compras' ? 'activa' : ''}
          onClick={() => setPestana('compras')}
        >
          Compras
        </button>
      </div>

      {pestana === 'productos' && (
        <>
          {conStockBajo > 0 && (
            <label className="interruptor">
              <input
                type="checkbox"
                checked={soloStockBajo}
                onChange={(evento) => setSoloStockBajo(evento.target.checked)}
              />
              Ver solo los {conStockBajo} productos con stock bajo
            </label>
          )}

          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="celda-numero">Precio</th>
                  <th className="celda-numero">Costo</th>
                  <th className="celda-numero">Stock</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {visibles.map((producto) => (
                  <tr key={producto.id} className={producto.activo ? '' : 'fila-inactiva'}>
                    <td>{producto.codigo}</td>
                    <td>
                      {producto.nombre}
                      {!producto.activo && ' (inactivo)'}
                    </td>
                    <td>{producto.categoria.nombre}</td>
                    <td className="celda-numero">{formatearPesos(producto.precioVenta)}</td>
                    <td className="celda-numero">{formatearPesos(producto.costo)}</td>
                    <td className="celda-numero">
                      <span className={producto.stockBajo ? 'etiqueta etiqueta-alerta' : ''}>
                        {producto.stockActual}
                      </span>{' '}
                      <small className="texto-suave">/ mín. {producto.stockMinimo}</small>
                    </td>
                    <td className="celda-acciones">
                      <button
                        type="button"
                        className="boton boton-pequeno"
                        onClick={() => setModal({ tipo: 'movimientos', producto })}
                      >
                        Movimientos
                      </button>
                      {esAdmin && (
                        <>
                          <button
                            type="button"
                            className="boton boton-pequeno"
                            onClick={() => setModal({ tipo: 'ajuste', producto })}
                          >
                            Ajustar
                          </button>
                          <button
                            type="button"
                            className="boton boton-pequeno"
                            onClick={() => setModal({ tipo: 'producto', producto })}
                          >
                            Editar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pestana === 'compras' && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>N.º</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Registró</th>
                <th className="celda-numero">Total</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id}>
                  <td>{compra.id}</td>
                  <td>{formatearFechaHora(compra.creadoEn)}</td>
                  <td>{compra.proveedor.nombre}</td>
                  <td>
                    {compra.detalles
                      .map((detalle) => `${detalle.cantidad} × ${detalle.producto.nombre}`)
                      .join(', ')}
                  </td>
                  <td>{compra.creadoPor.nombre}</td>
                  <td className="celda-numero">{formatearPesos(compra.total)}</td>
                </tr>
              ))}
              {compras.length === 0 && (
                <tr>
                  <td colSpan={6} className="tabla-vacia">
                    Todavía no hay compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal?.tipo === 'producto' && (
        <Modal titulo={modal.producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={cerrar}>
          <ProductoForm
            producto={modal.producto}
            onGuardar={(datos) =>
              guardarYRecargar(() =>
                modal.producto
                  ? api.patch(`/inventario/productos/${modal.producto.id}`, datos)
                  : api.post('/inventario/productos', datos),
              )
            }
            onCancelar={cerrar}
          />
          {modal.producto && (
            <button
              type="button"
              className="boton boton-pequeno boton-texto"
              onClick={() =>
                guardarYRecargar(() =>
                  api.patch(`/inventario/productos/${modal.producto.id}`, {
                    activo: !modal.producto.activo,
                  }),
                )
              }
            >
              {modal.producto.activo ? 'Desactivar producto' : 'Activar producto'}
            </button>
          )}
        </Modal>
      )}

      {modal?.tipo === 'ajuste' && (
        <Modal titulo={`Ajustar stock: ${modal.producto.nombre}`} onCerrar={cerrar}>
          <AjusteForm
            producto={modal.producto}
            onGuardar={(datos) =>
              guardarYRecargar(() =>
                api.post(`/inventario/productos/${modal.producto.id}/ajuste`, datos),
              )
            }
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {modal?.tipo === 'movimientos' && (
        <Modal titulo={`Movimientos: ${modal.producto.nombre}`} onCerrar={cerrar}>
          <Movimientos producto={modal.producto} />
        </Modal>
      )}

      {modal?.tipo === 'compra' && (
        <Modal titulo="Registrar compra al proveedor" onCerrar={cerrar}>
          <CompraForm
            productos={productos.filter((p) => p.activo)}
            onGuardar={(datos) => guardarYRecargar(() => api.post('/inventario/compras', datos))}
            onCancelar={cerrar}
          />
        </Modal>
      )}
    </>
  );
}

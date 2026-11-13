import { useEffect, useState } from 'react';
import { FormularioPagos } from '../../../components/FormularioPagos/FormularioPagos.jsx';
import { Alerta, AlertaError, EncabezadoPagina, Modal } from '../../../components/ui/index.js';
import { comprobante } from '../../../lib/formato.js';
import { inventarioApi } from '../../inventario/api/inventarioApi.js';
import { tiendaApi } from '../api/tiendaApi.js';
import { Carrito } from '../components/Carrito/Carrito.jsx';
import { CatalogoProductos } from '../components/CatalogoProductos/CatalogoProductos.jsx';
import { useCarrito } from '../hooks/useCarrito.js';
import estilos from './TiendaPage.module.css';

export function TiendaPage() {
  const carrito = useCarrito();
  const [productos, setProductos] = useState([]);
  const [hospedadas, setHospedadas] = useState([]);
  const [tipo, setTipo] = useState('paso');
  const [reservaId, setReservaId] = useState('');
  const [conNombre, setConNombre] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cobrando, setCobrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(null);

  const cargarDatos = () => {
    inventarioApi.productos().then(setProductos).catch(setError);
    tiendaApi.huespedesHospedados().then(setHospedadas).catch(setError);
  };

  useEffect(() => {
    inventarioApi.productos().then(setProductos).catch(setError);
    tiendaApi.huespedesHospedados().then(setHospedadas).catch(setError);
  }, []);

  const terminar = (mensaje) => {
    carrito.vaciar();
    setNombre('');
    setConNombre(false);
    setCobrando(false);
    setAviso(mensaje);
    cargarDatos();
  };

  const cobrar = async (pagos) => {
    const venta = await tiendaApi.vender({
      items: carrito.items,
      pagos,
      compradorNombre: conNombre && nombre.trim() ? nombre.trim() : null,
    });
    terminar(`Venta registrada. Comprobante ${comprobante(venta.id)}.`);
  };

  const cargar = async () => {
    setProcesando(true);
    setError(null);
    try {
      const reserva = await tiendaApi.cargarAHabitacion(reservaId, carrito.items);
      const numeros = reserva.habitaciones.map((h) => h.habitacion.numero).join(', ');
      terminar(`Cargado a la cuenta de la habitación ${numeros} (${reserva.codigo}).`);
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <EncabezadoPagina
        antetitulo="Punto de venta"
        titulo="Tienda"
        descripcion="Productos empacados para huéspedes y visitantes."
      />
      <Alerta tipo="exito">{aviso}</Alerta>
      <AlertaError error={!cobrando ? error : null} />

      <div className={estilos.distribucion}>
        <CatalogoProductos
          productos={productos}
          onAgregar={(producto) => {
            setAviso(null);
            carrito.agregar(producto);
          }}
        />
        <Carrito
          carrito={carrito}
          hospedadas={hospedadas}
          procesando={procesando}
          comprador={{
            tipo,
            setTipo,
            reservaId,
            setReservaId,
            conNombre,
            setConNombre,
            nombre,
            setNombre,
          }}
          onCobrar={() => setCobrando(true)}
          onCargar={cargar}
        />
      </div>

      {cobrando && (
        <Modal titulo="Cobrar venta" onCerrar={() => setCobrando(false)}>
          <FormularioPagos
            monto={carrito.total}
            textoBoton="Registrar venta"
            onConfirmar={cobrar}
            onCancelar={() => setCobrando(false)}
          />
        </Modal>
      )}
    </>
  );
}

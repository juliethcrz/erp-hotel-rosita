import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import {
  Alerta,
  AlertaError,
  Boton,
  EncabezadoPagina,
  Modal,
  Tabla,
  Tarjeta,
} from '../../../components/ui/index.js';
import { FormularioPagos } from '../../../components/FormularioPagos/FormularioPagos.jsx';
import { formatearFecha, formatearPesos } from '../../../lib/formato.js';
import { AccionesReserva } from '../components/AccionesReserva/AccionesReserva.jsx';
import { ConfirmarAccion } from '../components/ConfirmarAccion/ConfirmarAccion.jsx';
import { EstadoReserva } from '../components/EstadoReserva/EstadoReserva.jsx';
import { FormularioConsumo } from '../components/FormularioConsumo/FormularioConsumo.jsx';
import { ResumenCuenta } from '../components/ResumenCuenta/ResumenCuenta.jsx';
import { TablaCobros } from '../components/TablaCobros/TablaCobros.jsx';
import { TablaConsumos } from '../components/TablaConsumos/TablaConsumos.jsx';
import { useReserva } from '../hooks/useReserva.js';
import estilos from './ReservaDetallePage.module.css';

const AVISO_CHECKOUT = 'Check-out registrado. Housekeeping ya recibió el aviso de limpieza.';

const COLUMNAS_HABITACIONES = [
  { clave: 'numero', titulo: 'Habitación', render: (l) => l.habitacion.numero },
  { clave: 'tipo', titulo: 'Tipo', render: (l) => l.habitacion.tipo.nombre },
  { clave: 'noches', titulo: 'Noches', numero: true },
  { clave: 'subtotal', titulo: 'Valor', numero: true, render: (l) => formatearPesos(l.subtotal) },
];

/** Acciones que solo piden confirmación (sin cobro) y el aviso que dejan al terminar. */
const CONFIRMACIONES = {
  checkin: {
    titulo: 'Confirmar check-in',
    mensaje: 'La estadía ya está pagada. ¿Registrar la llegada del huésped?',
    textoBoton: 'Hacer check-in',
  },
  checkout: {
    titulo: 'Confirmar check-out',
    mensaje: 'No hay consumos pendientes. Las habitaciones pasarán a limpieza.',
    textoBoton: 'Hacer check-out',
    aviso: () => AVISO_CHECKOUT,
  },
  'no-show': {
    titulo: 'Marcar no-show',
    mensaje: 'El huésped no se presentó. El anticipo queda retenido por el hotel.',
    textoBoton: 'Marcar no-show',
    peligro: true,
  },
  cancelar: {
    titulo: 'Cancelar reserva',
    mensaje:
      'Si faltan más de 24 horas para la llegada se devuelve el anticipo; si no, queda retenido.',
    textoBoton: 'Cancelar reserva',
    peligro: true,
    aviso: (resultado) =>
      resultado.devolucion > 0
        ? `Reserva cancelada. Se registró la devolución de ${formatearPesos(resultado.devolucion)} en la caja.`
        : 'Reserva cancelada. El anticipo, si lo había, queda retenido por el hotel.',
  },
};

export function ReservaDetallePage() {
  const { id } = useParams();
  const { reserva, error, ejecutar } = useReserva(id);
  const [accion, setAccion] = useState(null);
  const [aviso, setAviso] = useState(null);

  if (!reserva) return <AlertaError error={error} />;

  const { resumen } = reserva;
  const cerrar = () => setAccion(null);

  const ejecutarYCerrar = async (ruta, cuerpo, mensajeAviso) => {
    const resultado = await ejecutar(ruta, cuerpo);
    setAccion(null);
    setAviso(mensajeAviso ? mensajeAviso(resultado) : null);
  };

  /** Check-in y check-out piden cobro solo si hay saldo; si no, basta con confirmar. */
  const elegirAccion = (nombre) => {
    setAviso(null);
    if (nombre === 'checkin' && resumen.saldoEstadia > 0) return setAccion('cobroCheckin');
    if (nombre === 'checkout' && resumen.consumosPendientes > 0) return setAccion('cobroCheckout');
    return setAccion(nombre);
  };

  const confirmacion = CONFIRMACIONES[accion];

  return (
    <>
      <Boton variante="fantasma" tamano="sm" icono={ArrowLeft} to="/reservas">
        Reservas
      </Boton>
      <EncabezadoPagina
        antetitulo={`Reserva ${reserva.codigo}`}
        titulo={`${reserva.titular.nombres} ${reserva.titular.apellidos}`}
        descripcion={`${formatearFecha(reserva.fechaLlegada)} → ${formatearFecha(reserva.fechaSalida)}`}
        acciones={<EstadoReserva estado={reserva.estado} />}
      />

      <Alerta tipo="exito">{aviso}</Alerta>
      <AlertaError error={accion ? null : error} />
      <AccionesReserva estado={reserva.estado} onAccion={elegirAccion} />

      <div className={estilos.columnas}>
        <Tarjeta titulo="Habitaciones">
          <Tabla columnas={COLUMNAS_HABITACIONES} filas={reserva.habitaciones} />
          {reserva.observaciones && <p className={estilos.nota}>{reserva.observaciones}</p>}
        </Tarjeta>
        <ResumenCuenta resumen={resumen} descuentoPorcentaje={reserva.descuentoPorcentaje} />
      </div>

      {reserva.consumos.length > 0 && (
        <Tarjeta titulo="Consumos de la tienda" className={estilos.seccion}>
          <TablaConsumos consumos={reserva.consumos} />
        </Tarjeta>
      )}

      {reserva.ventas.length > 0 && (
        <Tarjeta titulo="Cobros" className={estilos.seccion}>
          <TablaCobros ventas={reserva.ventas} />
        </Tarjeta>
      )}

      {confirmacion && (
        <ConfirmarAccion
          {...confirmacion}
          onConfirmar={() =>
            ejecutarYCerrar(
              accion,
              accion === 'checkin' || accion === 'checkout' ? { pagos: [] } : {},
              confirmacion.aviso,
            )
          }
          onCerrar={cerrar}
        />
      )}

      {accion === 'anticipo' && (
        <Modal titulo="Registrar anticipo" onCerrar={cerrar}>
          <FormularioPagos
            monto={resumen.anticipoRequerido}
            textoBoton="Confirmar reserva"
            onConfirmar={(pagos) => ejecutarYCerrar('anticipo', { pagos })}
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {accion === 'cobroCheckin' && (
        <Modal titulo="Check-in: saldo de la estadía" onCerrar={cerrar}>
          <FormularioPagos
            monto={resumen.saldoEstadia}
            textoBoton="Cobrar y hacer check-in"
            onConfirmar={(pagos) => ejecutarYCerrar('checkin', { pagos })}
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {accion === 'cobroCheckout' && (
        <Modal titulo="Check-out: consumos de la tienda" onCerrar={cerrar}>
          <FormularioPagos
            monto={resumen.consumosPendientes}
            textoBoton="Cobrar y hacer check-out"
            onConfirmar={(pagos) => ejecutarYCerrar('checkout', { pagos }, () => AVISO_CHECKOUT)}
            onCancelar={cerrar}
          />
        </Modal>
      )}

      {accion === 'consumo' && (
        <Modal titulo="Cargar consumo a la habitación" onCerrar={cerrar}>
          <FormularioConsumo
            onGuardar={(datos) => ejecutarYCerrar('consumos', datos)}
            onCancelar={cerrar}
          />
        </Modal>
      )}
    </>
  );
}

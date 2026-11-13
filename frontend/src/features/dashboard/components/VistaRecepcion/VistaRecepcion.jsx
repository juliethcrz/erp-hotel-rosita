import { BedDouble, CalendarCheck, DoorOpen, LogOut } from 'lucide-react';
import { Cifra } from '../../../../components/ui/index.js';
import { ListaReservasDia } from '../ListaReservasDia/ListaReservasDia.jsx';
import { PanelCaja } from '../PanelCaja/PanelCaja.jsx';
import estilos from '../dashboard.module.css';

/** Cifras y listas del día que comparten recepción y administración. */
export function CifrasDelDia({ datos }) {
  const { habitaciones, llegadas, salidas } = datos;
  return (
    <section className={estilos.cifras}>
      <Cifra
        destacada
        etiqueta="Ocupación"
        valor={`${habitaciones.ocupacion} %`}
        detalle={`${habitaciones.conteo.OCUPADA ?? 0} de ${habitaciones.total} habitaciones`}
        icono={BedDouble}
      />
      <Cifra
        etiqueta="Disponibles"
        valor={habitaciones.conteo.DISPONIBLE ?? 0}
        detalle="Listas para vender"
        icono={DoorOpen}
      />
      <Cifra etiqueta="Llegadas hoy" valor={llegadas.length} icono={CalendarCheck} />
      <Cifra etiqueta="Salidas hoy" valor={salidas.length} icono={LogOut} />
    </section>
  );
}

export function ListasDelDia({ datos }) {
  return (
    <>
      <ListaReservasDia
        titulo="Llegadas de hoy"
        tipo="llegada"
        hoy={datos.fecha}
        reservas={datos.llegadas}
        vacio="No hay llegadas pendientes para hoy."
      />
      <ListaReservasDia
        titulo="Salidas de hoy"
        tipo="salida"
        hoy={datos.fecha}
        reservas={datos.salidas}
        vacio="No hay check-outs pendientes."
      />
    </>
  );
}

export function VistaRecepcion({ datos }) {
  return (
    <div className={estilos.vista}>
      <CifrasDelDia datos={datos} />
      <div className={estilos.rejilla}>
        <ListasDelDia datos={datos} />
        <PanelCaja caja={datos.caja} />
      </div>
    </div>
  );
}

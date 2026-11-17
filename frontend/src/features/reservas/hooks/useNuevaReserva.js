import { useState } from 'react';
import { hoyLocal } from '../../../lib/formato.js';
import { reservasApi } from '../api/reservasApi.js';
import { calcularTotales } from '../utils/calcularTotales.js';

/** Estado del asistente de nueva reserva: fechas → habitaciones → titular → confirmación. */
export function useNuevaReserva() {
  const [paso, setPaso] = useState(0);
  const [fechas, setFechas] = useState({ llegada: hoyLocal(), salida: '' });
  const [disponibles, setDisponibles] = useState([]);
  const [cotizaciones, setCotizaciones] = useState({});
  const [seleccion, setSeleccion] = useState([]);
  const [titular, setTitular] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  const buscarDisponibilidad = async () => {
    const { llegada, salida } = fechas;
    const habitaciones = await reservasApi.habitacionesDisponibles(llegada, salida);
    const tipos = [...new Set(habitaciones.map((h) => h.tipoId))];
    const precios = await Promise.all(
      tipos.map((tipoId) => reservasApi.cotizar(tipoId, llegada, salida)),
    );
    setDisponibles(habitaciones);
    setCotizaciones(Object.fromEntries(tipos.map((tipoId, i) => [tipoId, precios[i]])));
    setSeleccion([]);
    setPaso(1);
  };

  const alternarHabitacion = (habitacion) => {
    setSeleccion((actual) =>
      actual.includes(habitacion.id)
        ? actual.filter((id) => id !== habitacion.id)
        : [...actual, habitacion.id],
    );
  };

  const elegidas = disponibles.filter((h) => seleccion.includes(h.id));
  const totales = calcularTotales(elegidas, cotizaciones, descuento);
  const noches = elegidas[0] ? cotizaciones[elegidas[0].tipoId].noches.length : 0;

  /** El titular queda registrado como huésped de la primera habitación. */
  const guardar = (pagosAnticipo) =>
    reservasApi.crear({
      titularId: titular.id,
      fechaLlegada: fechas.llegada,
      fechaSalida: fechas.salida,
      habitaciones: seleccion.map((habitacionId, indice) => ({
        habitacionId,
        huespedes: indice === 0 ? [titular.id] : [],
      })),
      descuentoPorcentaje: Number(descuento) || 0,
      observaciones: observaciones.trim() || null,
      ...(pagosAnticipo && { anticipo: { pagos: pagosAnticipo } }),
    });

  return {
    paso,
    setPaso,
    fechas,
    setFechas,
    disponibles,
    cotizaciones,
    seleccion,
    alternarHabitacion,
    titular,
    setTitular,
    descuento,
    setDescuento,
    observaciones,
    setObservaciones,
    elegidas,
    totales,
    noches,
    buscarDisponibilidad,
    guardar,
  };
}

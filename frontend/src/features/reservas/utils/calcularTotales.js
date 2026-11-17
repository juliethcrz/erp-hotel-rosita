export const PORCENTAJE_ANTICIPO = 0.5;

/** Totales de una reserva nueva a partir de las habitaciones elegidas y sus cotizaciones. */
export function calcularTotales(habitaciones, cotizaciones, descuentoPorcentaje) {
  const totalHabitaciones = habitaciones.reduce(
    (suma, habitacion) => suma + cotizaciones[habitacion.tipoId].total,
    0,
  );
  const descuento = Math.round((totalHabitaciones * (Number(descuentoPorcentaje) || 0)) / 100);
  const totalEstadia = totalHabitaciones - descuento;

  return {
    totalHabitaciones,
    descuento,
    totalEstadia,
    anticipo: Math.round(totalEstadia * PORCENTAJE_ANTICIPO),
  };
}

export function textoNoches(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'noche' : 'noches'}`;
}

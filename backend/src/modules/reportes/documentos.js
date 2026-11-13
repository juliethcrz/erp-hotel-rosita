/**
 * Convierte cada reporte en un documento neutro (título, cifras y tablas) que
 * los exportadores de PDF y Excel saben dibujar. Así el formato del archivo no
 * depende de cómo se calcula cada reporte.
 */

const METODOS = {
  EFECTIVO: 'Efectivo',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  BANCOLOMBIA: 'Bancolombia',
  TRANSFERENCIA: 'Transferencia',
};
const CONCEPTOS = {
  ANTICIPO: 'Anticipo',
  SALDO_CHECKIN: 'Saldo en el check-in',
  CONSUMOS_CHECKOUT: 'Consumos en el check-out',
  VENTA_DIRECTA: 'Venta en tienda',
};

const filasPorMetodo = (porMetodo, total) =>
  Object.entries(porMetodo)
    .filter(([, valor]) => valor !== 0)
    .map(([metodo, valor]) => ({
      metodo: METODOS[metodo],
      valor,
      participacion: total ? valor / total : 0,
    }));

function documentoIngresos(reporte) {
  const { totales } = reporte;
  return {
    titulo: 'Reporte de ingresos',
    periodo: reporte.periodo,
    cifras: [
      { etiqueta: 'Ingresos totales', valor: totales.total, formato: 'pesos' },
      { etiqueta: 'Base gravable', valor: totales.subtotal, formato: 'pesos' },
      { etiqueta: 'IVA (19 %)', valor: totales.iva, formato: 'pesos' },
      { etiqueta: 'Comprobantes', valor: totales.ventas, formato: 'numero' },
      { etiqueta: 'Ticket promedio', valor: totales.ticketPromedio, formato: 'pesos' },
      { etiqueta: 'Descuentos', valor: totales.descuentos, formato: 'pesos' },
    ],
    tablas: [
      {
        titulo: 'Por línea de negocio',
        columnas: [
          { clave: 'linea', titulo: 'Línea', ancho: 3 },
          { clave: 'valor', titulo: 'Valor', formato: 'pesos', ancho: 2 },
          { clave: 'participacion', titulo: 'Participación', formato: 'porcentaje', ancho: 2 },
        ],
        filas: [
          { linea: 'Alojamiento', valor: reporte.porLinea.ALOJAMIENTO },
          { linea: 'Tienda', valor: reporte.porLinea.TIENDA },
        ].map((fila) => ({
          ...fila,
          participacion: totales.total ? fila.valor / totales.total : 0,
        })),
      },
      {
        titulo: 'Por método de pago',
        columnas: [
          { clave: 'metodo', titulo: 'Método', ancho: 3 },
          { clave: 'valor', titulo: 'Valor', formato: 'pesos', ancho: 2 },
          { clave: 'participacion', titulo: 'Participación', formato: 'porcentaje', ancho: 2 },
        ],
        filas: filasPorMetodo(reporte.porMetodo, totales.total),
      },
      {
        titulo: 'Ingresos por día',
        columnas: [
          { clave: 'fecha', titulo: 'Fecha', formato: 'fecha', ancho: 2 },
          { clave: 'total', titulo: 'Ingresos', formato: 'pesos', ancho: 2 },
        ],
        filas: reporte.porDia,
      },
      {
        titulo: 'Comprobantes',
        columnas: [
          { clave: 'comprobante', titulo: 'N.º', ancho: 1 },
          { clave: 'fecha', titulo: 'Fecha', formato: 'fechaHora', ancho: 2.5 },
          { clave: 'concepto', titulo: 'Concepto', ancho: 3.5 },
          { clave: 'cliente', titulo: 'Cliente', ancho: 3 },
          { clave: 'metodos', titulo: 'Pago', ancho: 2 },
          { clave: 'total', titulo: 'Total', formato: 'pesos', ancho: 2 },
        ],
        filas: reporte.ventas.map((venta) => ({
          comprobante: String(venta.id).padStart(5, '0'),
          fecha: venta.fecha,
          concepto: venta.reserva
            ? `${CONCEPTOS[venta.tipo]} · ${venta.reserva}`
            : CONCEPTOS[venta.tipo],
          cliente: venta.cliente ?? 'No aplica',
          metodos: venta.metodos.map((metodo) => METODOS[metodo]).join(' + '),
          total: venta.total,
        })),
      },
    ],
  };
}

function documentoOcupacion(reporte) {
  const { totales } = reporte;
  return {
    titulo: 'Reporte de ocupación',
    periodo: reporte.periodo,
    cifras: [
      { etiqueta: 'Ocupación', valor: totales.ocupacion / 100, formato: 'porcentaje' },
      { etiqueta: 'Noches vendidas', valor: totales.nochesVendidas, formato: 'numero' },
      { etiqueta: 'Noches disponibles', valor: totales.nochesDisponibles, formato: 'numero' },
      { etiqueta: 'Tarifa promedio por noche', valor: totales.tarifaPromedio, formato: 'pesos' },
      {
        etiqueta: 'Ingreso por habitación disponible',
        valor: totales.ingresoPorHabitacionDisponible,
        formato: 'pesos',
      },
      { etiqueta: 'Llegadas', valor: totales.llegadas, formato: 'numero' },
      { etiqueta: 'Cancelaciones', valor: totales.cancelaciones, formato: 'numero' },
      { etiqueta: 'No-shows', valor: totales.noShows, formato: 'numero' },
    ],
    tablas: [
      {
        titulo: 'Por tipo de habitación',
        columnas: [
          { clave: 'tipo', titulo: 'Tipo', ancho: 3 },
          { clave: 'habitaciones', titulo: 'Habitaciones', formato: 'numero', ancho: 2 },
          { clave: 'noches', titulo: 'Noches vendidas', formato: 'numero', ancho: 2 },
          { clave: 'ocupacion', titulo: 'Ocupación', formato: 'porcentaje', ancho: 2 },
          { clave: 'ingreso', titulo: 'Ingreso estimado', formato: 'pesos', ancho: 2 },
        ],
        filas: reporte.porTipo.map((fila) => ({ ...fila, ocupacion: fila.ocupacion / 100 })),
      },
      {
        titulo: 'Ocupación por día',
        columnas: [
          { clave: 'fecha', titulo: 'Fecha', formato: 'fecha', ancho: 2 },
          { clave: 'noches', titulo: 'Habitaciones ocupadas', formato: 'numero', ancho: 2 },
          { clave: 'ocupacion', titulo: 'Ocupación', formato: 'porcentaje', ancho: 2 },
        ],
        filas: reporte.porDia.map((fila) => ({ ...fila, ocupacion: fila.ocupacion / 100 })),
      },
    ],
  };
}

function documentoCaja(reporte) {
  const { totales } = reporte;
  return {
    titulo: 'Reporte de caja',
    periodo: reporte.periodo,
    cifras: [
      { etiqueta: 'Ingresos', valor: totales.ingresos, formato: 'pesos' },
      { etiqueta: 'Egresos', valor: totales.egresos, formato: 'pesos' },
      { etiqueta: 'Neto', valor: totales.neto, formato: 'pesos' },
      { etiqueta: 'Turnos de caja', valor: totales.cajas, formato: 'numero' },
    ],
    tablas: [
      {
        titulo: 'Neto por método de pago',
        columnas: [
          { clave: 'metodo', titulo: 'Método', ancho: 3 },
          { clave: 'valor', titulo: 'Neto', formato: 'pesos', ancho: 2 },
          { clave: 'participacion', titulo: 'Participación', formato: 'porcentaje', ancho: 2 },
        ],
        filas: filasPorMetodo(reporte.porMetodo, totales.neto),
      },
      {
        titulo: 'Turnos de caja',
        columnas: [
          { clave: 'id', titulo: 'N.º', ancho: 0.7 },
          { clave: 'abiertaEn', titulo: 'Apertura', formato: 'fechaHora', ancho: 2.7 },
          { clave: 'cerradaEn', titulo: 'Cierre', formato: 'fechaHora', ancho: 2.7 },
          { clave: 'responsable', titulo: 'Responsable', ancho: 2.4 },
          { clave: 'ingresos', titulo: 'Ingresos', formato: 'pesos', ancho: 2 },
          { clave: 'egresos', titulo: 'Egresos', formato: 'pesos', ancho: 1.8 },
          { clave: 'efectivoEnCaja', titulo: 'Efectivo en caja', formato: 'pesos', ancho: 2.4 },
        ],
        filas: reporte.cajas.map((caja) => ({
          ...caja,
          cerradaEn: caja.cerradaEn ?? 'Abierta',
          responsable: caja.cerradaPor ?? caja.abiertaPor,
        })),
      },
    ],
  };
}

export const DOCUMENTOS = {
  ingresos: documentoIngresos,
  ocupacion: documentoOcupacion,
  caja: documentoCaja,
};

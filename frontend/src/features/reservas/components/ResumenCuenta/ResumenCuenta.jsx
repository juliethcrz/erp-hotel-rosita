import { ListaValores, Tarjeta } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';

export function ResumenCuenta({ resumen, descuentoPorcentaje }) {
  return (
    <Tarjeta titulo="Cuenta">
      <ListaValores
        filas={[
          { etiqueta: 'Habitaciones', valor: formatearPesos(resumen.totalHabitaciones) },
          resumen.descuento > 0 && {
            etiqueta: `Descuento (${descuentoPorcentaje} %)`,
            valor: `−${formatearPesos(resumen.descuento)}`,
          },
          { etiqueta: 'Total estadía', valor: formatearPesos(resumen.totalEstadia), total: true },
          { etiqueta: 'Pagado', valor: formatearPesos(resumen.pagadoEstadia) },
          { etiqueta: 'Saldo de la estadía', valor: formatearPesos(resumen.saldoEstadia) },
          { etiqueta: 'Consumos por pagar', valor: formatearPesos(resumen.consumosPendientes) },
        ]}
      />
    </Tarjeta>
  );
}

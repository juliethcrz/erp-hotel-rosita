import { Banknote, Receipt, ShoppingBag, Wallet } from 'lucide-react';
import { Cifra, Tabla, Tarjeta } from '../../../../components/ui/index.js';
import { TIPOS_COBRO } from '../../../../constants/catalogos.js';
import { comprobante, formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';
import { NOMBRES_METODO } from '../../utils/periodos.js';
import { GraficoBarras } from '../GraficoBarras/GraficoBarras.jsx';
import { TablaReparto } from '../TablaReparto/TablaReparto.jsx';
import estilos from '../reportes.module.css';

const COLUMNAS = [
  { clave: 'id', titulo: 'Comprobante', render: (v) => comprobante(v.id) },
  { clave: 'fecha', titulo: 'Fecha', render: (v) => formatearFechaHora(v.fecha) },
  {
    clave: 'concepto',
    titulo: 'Concepto',
    render: (v) => (v.reserva ? `${TIPOS_COBRO[v.tipo]} · ${v.reserva}` : TIPOS_COBRO[v.tipo]),
  },
  { clave: 'cliente', titulo: 'Cliente', render: (v) => v.cliente ?? 'No aplica' },
  {
    clave: 'metodos',
    titulo: 'Pago',
    render: (v) => v.metodos.map((m) => NOMBRES_METODO[m]).join(' + '),
  },
  { clave: 'total', titulo: 'Total', numero: true, render: (v) => formatearPesos(v.total) },
];

export function ReporteIngresos({ datos }) {
  const { totales, porLinea, porMetodo } = datos;

  return (
    <div className={estilos.reporte}>
      <div className={estilos.cifras}>
        <Cifra
          etiqueta="Ingresos totales"
          valor={formatearPesos(totales.total)}
          detalle={`Base ${formatearPesos(totales.subtotal)} + IVA ${formatearPesos(totales.iva)}`}
          icono={Banknote}
          destacada
        />
        <Cifra
          etiqueta="Alojamiento"
          valor={formatearPesos(porLinea.ALOJAMIENTO)}
          detalle="Anticipos y saldos de reservas"
          icono={Wallet}
        />
        <Cifra
          etiqueta="Tienda"
          valor={formatearPesos(porLinea.TIENDA)}
          detalle="Mostrador y consumos de huéspedes"
          icono={ShoppingBag}
        />
        <Cifra
          etiqueta="Comprobantes"
          valor={totales.ventas}
          detalle={`Ticket promedio ${formatearPesos(totales.ticketPromedio)}`}
          icono={Receipt}
        />
      </div>

      <div className={estilos.columnas}>
        <Tarjeta titulo="Ingresos por día" className={estilos.ancha}>
          <GraficoBarras
            datos={datos.porDia.map((d) => ({ fecha: d.fecha, valor: d.total }))}
            formatear={formatearPesos}
          />
        </Tarjeta>
        <Tarjeta titulo="Por método de pago">
          <TablaReparto
            filas={Object.entries(porMetodo).map(([metodo, valor]) => ({
              etiqueta: NOMBRES_METODO[metodo],
              valor,
            }))}
            formatear={formatearPesos}
          />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Comprobantes del periodo">
        <Tabla columnas={COLUMNAS} filas={datos.ventas} vacio="No hubo cobros en el periodo." />
      </Tarjeta>
    </div>
  );
}

import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from 'lucide-react';
import { Cifra, Insignia, Tabla, Tarjeta } from '../../../../components/ui/index.js';
import { formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';
import { NOMBRES_METODO } from '../../utils/periodos.js';
import { TablaReparto } from '../TablaReparto/TablaReparto.jsx';
import estilos from '../reportes.module.css';

const COLUMNAS = [
  { clave: 'id', titulo: 'Turno' },
  { clave: 'abiertaEn', titulo: 'Apertura', render: (c) => formatearFechaHora(c.abiertaEn) },
  {
    clave: 'cerradaEn',
    titulo: 'Cierre',
    render: (c) =>
      c.cerradaEn ? formatearFechaHora(c.cerradaEn) : <Insignia tono="exito">Abierta</Insignia>,
  },
  { clave: 'responsable', titulo: 'Responsable', render: (c) => c.cerradaPor ?? c.abiertaPor },
  {
    clave: 'ingresos',
    titulo: 'Ingresos',
    numero: true,
    render: (c) => formatearPesos(c.ingresos),
  },
  { clave: 'egresos', titulo: 'Egresos', numero: true, render: (c) => formatearPesos(c.egresos) },
  {
    clave: 'efectivo',
    titulo: 'Efectivo en caja',
    numero: true,
    render: (c) => formatearPesos(c.efectivoEnCaja),
  },
];

export function ReporteCaja({ datos }) {
  const { totales, porMetodo } = datos;

  return (
    <div className={estilos.reporte}>
      <div className={estilos.cifras}>
        <Cifra
          etiqueta="Neto del periodo"
          valor={formatearPesos(totales.neto)}
          detalle="Ingresos menos egresos"
          icono={Scale}
          destacada
        />
        <Cifra etiqueta="Ingresos" valor={formatearPesos(totales.ingresos)} icono={ArrowUpCircle} />
        <Cifra
          etiqueta="Egresos"
          valor={formatearPesos(totales.egresos)}
          detalle="Devoluciones de anticipos"
          icono={ArrowDownCircle}
        />
        <Cifra etiqueta="Turnos de caja" valor={totales.cajas} icono={Wallet} />
      </div>

      <div className={estilos.columnas}>
        <Tarjeta titulo="Turnos de caja" className={estilos.ancha}>
          <Tabla columnas={COLUMNAS} filas={datos.cajas} vacio="No se abrió caja en el periodo." />
        </Tarjeta>
        <Tarjeta titulo="Neto por método de pago">
          <TablaReparto
            filas={Object.entries(porMetodo).map(([metodo, valor]) => ({
              etiqueta: NOMBRES_METODO[metodo],
              valor,
            }))}
            formatear={formatearPesos}
          />
        </Tarjeta>
      </div>
    </div>
  );
}

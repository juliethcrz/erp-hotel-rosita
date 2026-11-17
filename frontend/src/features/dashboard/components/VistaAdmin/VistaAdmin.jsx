import { Tarjeta } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { GraficoBarras } from '../../../reportes/components/GraficoBarras/GraficoBarras.jsx';
import { AlertaStock } from '../AlertaStock/AlertaStock.jsx';
import { PanelCaja } from '../PanelCaja/PanelCaja.jsx';
import { PanelLimpiezas } from '../PanelLimpiezas/PanelLimpiezas.jsx';
import { CifrasDelDia, ListasDelDia } from '../VistaRecepcion/VistaRecepcion.jsx';
import estilos from '../dashboard.module.css';

export function VistaAdmin({ datos }) {
  const { ingresos } = datos;

  return (
    <div className={estilos.vista}>
      <CifrasDelDia datos={datos} />

      <div className={estilos.principal}>
        <Tarjeta
          titulo="Ingresos de los últimos 7 días"
          acciones={
            <strong className={estilos.totalSemana}>{formatearPesos(ingresos.total)}</strong>
          }
        >
          <p className={estilos.subtitulo}>Hoy: {formatearPesos(ingresos.hoy)}</p>
          <GraficoBarras
            datos={ingresos.porDia.map((dia) => ({ fecha: dia.fecha, valor: dia.total }))}
            formatear={formatearPesos}
          />
        </Tarjeta>
        <PanelCaja caja={datos.caja} />
      </div>

      <div className={estilos.rejilla}>
        <ListasDelDia datos={datos} />
        <PanelLimpiezas limpiezas={datos.limpiezas} />
        <AlertaStock productos={datos.stockBajo} />
      </div>
    </div>
  );
}

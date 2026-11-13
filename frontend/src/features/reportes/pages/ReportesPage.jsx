import { BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
import {
  AlertaError,
  Boton,
  EncabezadoPagina,
  EstadoVacio,
  Pestanas,
} from '../../../components/ui/index.js';
import { FiltroPeriodo } from '../components/FiltroPeriodo/FiltroPeriodo.jsx';
import { ReporteCaja } from '../components/ReporteCaja/ReporteCaja.jsx';
import { ReporteIngresos } from '../components/ReporteIngresos/ReporteIngresos.jsx';
import { ReporteOcupacion } from '../components/ReporteOcupacion/ReporteOcupacion.jsx';
import { useExportarReporte } from '../hooks/useExportarReporte.js';
import { useReporte } from '../hooks/useReporte.js';
import { PERIODOS_RAPIDOS } from '../utils/periodos.js';
import estilos from './ReportesPage.module.css';

const REPORTES = [
  { valor: 'ingresos', etiqueta: 'Ingresos', componente: ReporteIngresos },
  { valor: 'ocupacion', etiqueta: 'Ocupación', componente: ReporteOcupacion },
  { valor: 'caja', etiqueta: 'Caja', componente: ReporteCaja },
];

const ESTE_MES = PERIODOS_RAPIDOS.find((opcion) => opcion.clave === 'mes');

export function ReportesPage() {
  const [tipo, setTipo] = useState('ingresos');
  const [periodo, setPeriodo] = useState(ESTE_MES.calcular);
  const { datos, error, cargando } = useReporte(tipo, periodo);
  const exportacion = useExportarReporte(tipo, periodo);
  const Reporte = REPORTES.find((reporte) => reporte.valor === tipo).componente;

  return (
    <>
      <EncabezadoPagina
        antetitulo="Administración"
        titulo="Reportes"
        descripcion="Ingresos, ocupación y caja del periodo, listos para descargar."
        acciones={
          <>
            <Boton
              icono={FileText}
              disabled={!datos || exportacion.exportando !== null}
              onClick={() => exportacion.exportar('pdf')}
            >
              {exportacion.exportando === 'pdf' ? 'Generando…' : 'PDF'}
            </Boton>
            <Boton
              variante="primario"
              icono={FileSpreadsheet}
              disabled={!datos || exportacion.exportando !== null}
              onClick={() => exportacion.exportar('xlsx')}
            >
              {exportacion.exportando === 'xlsx' ? 'Generando…' : 'Excel'}
            </Boton>
          </>
        }
      />

      <div className={estilos.pestanas}>
        <Pestanas etiqueta="Tipo de reporte" opciones={REPORTES} valor={tipo} onCambiar={setTipo} />
      </div>
      <FiltroPeriodo periodo={periodo} onCambiar={setPeriodo} />

      <AlertaError error={error ?? exportacion.error} />

      {datos && <Reporte datos={datos} />}
      {!datos && cargando && <EstadoVacio icono={BarChart3} titulo="Calculando el reporte…" />}
    </>
  );
}

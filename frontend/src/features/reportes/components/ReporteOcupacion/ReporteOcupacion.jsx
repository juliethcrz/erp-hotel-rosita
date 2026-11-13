import { BedDouble, CalendarCheck, Moon, TrendingUp } from 'lucide-react';
import { Cifra, Tabla, Tarjeta } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { porcentaje } from '../../utils/periodos.js';
import { GraficoBarras } from '../GraficoBarras/GraficoBarras.jsx';
import estilos from '../reportes.module.css';

const COLUMNAS = [
  { clave: 'tipo', titulo: 'Tipo' },
  { clave: 'habitaciones', titulo: 'Habitaciones', numero: true },
  { clave: 'noches', titulo: 'Noches vendidas', numero: true },
  { clave: 'ocupacion', titulo: 'Ocupación', numero: true, render: (t) => porcentaje(t.ocupacion) },
  {
    clave: 'ingreso',
    titulo: 'Ingreso estimado',
    numero: true,
    render: (t) => formatearPesos(t.ingreso),
  },
];

export function ReporteOcupacion({ datos }) {
  const { totales } = datos;

  return (
    <div className={estilos.reporte}>
      <div className={estilos.cifras}>
        <Cifra
          etiqueta="Ocupación"
          valor={porcentaje(totales.ocupacion)}
          detalle={`${totales.nochesVendidas} de ${totales.nochesDisponibles} noches`}
          icono={BedDouble}
          destacada
        />
        <Cifra
          etiqueta="Tarifa promedio"
          valor={formatearPesos(totales.tarifaPromedio)}
          detalle="Por noche vendida"
          icono={Moon}
        />
        <Cifra
          etiqueta="Ingreso por habitación"
          valor={formatearPesos(totales.ingresoPorHabitacionDisponible)}
          detalle="Por noche disponible (RevPAR)"
          icono={TrendingUp}
        />
        <Cifra
          etiqueta="Llegadas"
          valor={totales.llegadas}
          detalle={`${totales.cancelaciones} cancelaciones · ${totales.noShows} no-show`}
          icono={CalendarCheck}
        />
      </div>

      <Tarjeta titulo="Ocupación por día">
        <GraficoBarras
          datos={datos.porDia.map((d) => ({ fecha: d.fecha, valor: d.ocupacion }))}
          formatear={porcentaje}
          maximo={100}
        />
      </Tarjeta>

      <Tarjeta titulo="Por tipo de habitación">
        <Tabla columnas={COLUMNAS} filas={datos.porTipo} claveFila="tipo" />
      </Tarjeta>
    </div>
  );
}

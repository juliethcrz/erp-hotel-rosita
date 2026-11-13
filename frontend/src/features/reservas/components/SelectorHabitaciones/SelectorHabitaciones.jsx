import { BedDouble } from 'lucide-react';
import { EstadoVacio } from '../../../../components/ui/index.js';
import { formatearPesos } from '../../../../lib/formato.js';
import { TarjetaHabitacion } from '../../../habitaciones/components/TarjetaHabitacion/TarjetaHabitacion.jsx';
import estilos from './SelectorHabitaciones.module.css';

export function SelectorHabitaciones({ habitaciones, cotizaciones, seleccion, onAlternar }) {
  if (habitaciones.length === 0) {
    return (
      <EstadoVacio
        icono={BedDouble}
        titulo="No hay habitaciones libres"
        descripcion="Prueba con otras fechas."
      />
    );
  }

  return (
    <div className={estilos.rejilla}>
      {habitaciones.map((habitacion) => {
        const cotizacion = cotizaciones[habitacion.tipoId];
        const temporadaAlta = cotizacion.noches.some((noche) => noche.temporada);
        return (
          <TarjetaHabitacion
            key={habitacion.id}
            habitacion={habitacion}
            seleccionada={seleccion.includes(habitacion.id)}
            onSeleccionar={onAlternar}
            pie={
              <span className={estilos.precio}>
                <strong>{formatearPesos(cotizacion.total)}</strong>
                {temporadaAlta && <small>Temporada alta</small>}
              </span>
            }
          />
        );
      })}
    </div>
  );
}

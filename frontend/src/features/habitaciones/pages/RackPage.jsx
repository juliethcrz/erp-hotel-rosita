import { useState } from 'react';
import { AlertaError, EncabezadoPagina } from '../../../components/ui/index.js';
import { useAuth } from '../../auth/AuthContext.js';
import { DetalleHabitacion } from '../components/DetalleHabitacion/DetalleHabitacion.jsx';
import { LeyendaEstados } from '../components/LeyendaEstados/LeyendaEstados.jsx';
import { TarjetaHabitacion } from '../components/TarjetaHabitacion/TarjetaHabitacion.jsx';
import { useHabitaciones } from '../hooks/useHabitaciones.js';
import { agruparPorPiso } from '../utils/estadosHabitacion.js';
import estilos from './RackPage.module.css';

export function RackPage() {
  const { usuario } = useAuth();
  const { habitaciones, error, cambiarEstado } = useHabitaciones();
  const [filtro, setFiltro] = useState(null);
  const [seleccionadaId, setSeleccionadaId] = useState(null);

  const conteo = habitaciones.reduce((total, h) => {
    total[h.estadoRack] = (total[h.estadoRack] ?? 0) + 1;
    return total;
  }, {});
  const visibles = filtro ? habitaciones.filter((h) => h.estadoRack === filtro) : habitaciones;
  const pisos = agruparPorPiso(visibles);
  const seleccionada = habitaciones.find((h) => h.id === seleccionadaId);

  return (
    <>
      <EncabezadoPagina
        antetitulo="Rack del día"
        titulo="Habitaciones"
        descripcion="Toca una habitación para ver su ficha."
      />
      <AlertaError error={error} />
      <LeyendaEstados conteo={conteo} filtro={filtro} onFiltrar={setFiltro} />

      {Object.entries(pisos).map(([piso, lista]) => (
        <section key={piso} className={estilos.piso}>
          <h2>
            Piso {piso} <span>{lista.length} habitaciones</span>
          </h2>
          <div className={estilos.rejilla}>
            {lista.map((habitacion) => (
              <TarjetaHabitacion
                key={habitacion.id}
                habitacion={habitacion}
                seleccionada={habitacion.id === seleccionadaId}
                onSeleccionar={(h) => setSeleccionadaId(h.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {seleccionada && (
        <DetalleHabitacion
          habitacion={seleccionada}
          rol={usuario.rol}
          onCambiarEstado={cambiarEstado}
          onCerrar={() => setSeleccionadaId(null)}
        />
      )}
    </>
  );
}

import { BedDouble, CalendarCheck, DoorOpen, Sparkles } from 'lucide-react';
import { AlertaError, Cifra, EncabezadoPagina } from '../../../components/ui/index.js';
import { saludoSegunHora } from '../../../lib/formato.js';
import { useAuth } from '../../auth/AuthContext.js';
import { useHabitaciones } from '../../habitaciones/hooks/useHabitaciones.js';
import estilos from './DashboardPage.module.css';

export function DashboardPage() {
  const { usuario } = useAuth();
  const { habitaciones, error } = useHabitaciones();

  const contar = (estado) => habitaciones.filter((h) => h.estadoRack === estado).length;
  const total = habitaciones.length;
  const ocupadas = contar('OCUPADA');
  const ocupacion = total ? Math.round((ocupadas / total) * 100) : 0;

  return (
    <>
      <EncabezadoPagina
        antetitulo={saludoSegunHora()}
        titulo={usuario.nombre}
        descripcion="Así está el hotel hoy."
      />
      <AlertaError error={error} />

      <section className={estilos.cifras}>
        <Cifra
          destacada
          etiqueta="Ocupación"
          valor={`${ocupacion} %`}
          detalle={`${ocupadas} de ${total} habitaciones`}
          icono={BedDouble}
        />
        <Cifra etiqueta="Disponibles" valor={contar('DISPONIBLE')} icono={DoorOpen} />
        <Cifra etiqueta="Reservadas hoy" valor={contar('RESERVADA')} icono={CalendarCheck} />
        <Cifra etiqueta="En limpieza" valor={contar('EN_LIMPIEZA')} icono={Sparkles} />
      </section>
    </>
  );
}

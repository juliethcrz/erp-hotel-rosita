import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { EncabezadoPagina } from '../components/EncabezadoPagina.jsx';
import { MensajeError } from '../components/MensajeError.jsx';
import { ESTADOS_HABITACION } from '../constants/catalogos.js';

export function DashboardPage() {
  const { usuario } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/habitaciones').then(setHabitaciones).catch(setError);
  }, []);

  const conteo = Object.keys(ESTADOS_HABITACION).map((estado) => ({
    estado,
    total: habitaciones.filter((habitacion) => habitacion.estadoRack === estado).length,
  }));

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombre}`}
        descripcion="Resumen del estado del hotel hoy"
      />
      <MensajeError error={error} />

      <section className="tarjetas-resumen">
        {conteo.map(({ estado, total }) => (
          <Link key={estado} to="/habitaciones" className={`tarjeta-resumen estado-${estado}`}>
            <span>{ESTADOS_HABITACION[estado]}</span>
            <strong>{total}</strong>
          </Link>
        ))}
      </section>
    </>
  );
}

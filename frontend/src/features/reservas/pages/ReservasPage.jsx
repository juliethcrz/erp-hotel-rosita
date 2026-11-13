import { CalendarPlus } from 'lucide-react';
import { Link } from 'react-router';
import {
  AlertaError,
  Boton,
  Buscador,
  EncabezadoPagina,
  Tabla,
} from '../../../components/ui/index.js';
import { ESTADOS_RESERVA } from '../../../constants/catalogos.js';
import { formatearFecha } from '../../../lib/formato.js';
import { EstadoReserva } from '../components/EstadoReserva/EstadoReserva.jsx';
import { useReservas } from '../hooks/useReservas.js';
import estilos from './ReservasPage.module.css';

const COLUMNAS = [
  {
    clave: 'codigo',
    titulo: 'Código',
    render: (r) => (
      <Link to={`/reservas/${r.id}`} className={estilos.codigo}>
        {r.codigo}
      </Link>
    ),
  },
  {
    clave: 'titular',
    titulo: 'Titular',
    render: (r) => `${r.titular.nombres} ${r.titular.apellidos}`,
  },
  {
    clave: 'habitaciones',
    titulo: 'Habitaciones',
    render: (r) => r.habitaciones.map((h) => h.habitacion.numero).join(', '),
  },
  { clave: 'llegada', titulo: 'Llegada', render: (r) => formatearFecha(r.fechaLlegada) },
  { clave: 'salida', titulo: 'Salida', render: (r) => formatearFecha(r.fechaSalida) },
  { clave: 'estado', titulo: 'Estado', render: (r) => <EstadoReserva estado={r.estado} /> },
];

export function ReservasPage() {
  const { reservas, estado, setEstado, busqueda, setBusqueda, error } = useReservas();

  return (
    <>
      <EncabezadoPagina
        antetitulo="Recepción"
        titulo="Reservas"
        descripcion="Reservas por WhatsApp, teléfono o en recepción."
        acciones={
          <Boton variante="primario" icono={CalendarPlus} to="/reservas/nueva">
            Nueva reserva
          </Boton>
        }
      />
      <AlertaError error={error} />

      <div className={estilos.filtros}>
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Código, nombre o documento del titular"
        />
        <select
          className={estilos.selector}
          value={estado}
          onChange={(evento) => setEstado(evento.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_RESERVA).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <Tabla columnas={COLUMNAS} filas={reservas} vacio="No hay reservas que coincidan." />
    </>
  );
}

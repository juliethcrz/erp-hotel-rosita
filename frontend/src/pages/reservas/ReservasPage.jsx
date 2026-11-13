import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { EstadoReserva } from '../../components/EstadoReserva.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { ESTADOS_RESERVA } from '../../constants/catalogos.js';
import { formatearFecha } from '../../utils/formato.js';

const ESPERA_BUSQUEDA_MS = 300;

export function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const parametros = new URLSearchParams();
    if (estado) parametros.set('estado', estado);
    if (busqueda.trim()) parametros.set('buscar', busqueda.trim());

    const temporizador = setTimeout(() => {
      api.get(`/reservas?${parametros}`).then(setReservas).catch(setError);
    }, ESPERA_BUSQUEDA_MS);

    return () => clearTimeout(temporizador);
  }, [estado, busqueda]);

  return (
    <>
      <EncabezadoPagina
        titulo="Reservas"
        descripcion="Reservas por WhatsApp, teléfono o en recepción"
        acciones={
          <Link to="/reservas/nueva" className="boton boton-primario">
            <Plus size={16} /> Nueva reserva
          </Link>
        }
      />
      <MensajeError error={error} />

      <div className="filtros">
        <label className="buscador">
          <Search size={16} />
          <input
            type="search"
            placeholder="Código, nombre o documento del titular"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </label>
        <select
          className="selector"
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

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Titular</th>
              <th>Habitaciones</th>
              <th>Llegada</th>
              <th>Salida</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>
                  <Link to={`/reservas/${reserva.id}`} className="enlace">
                    {reserva.codigo}
                  </Link>
                </td>
                <td>
                  {reserva.titular.nombres} {reserva.titular.apellidos}
                </td>
                <td>{reserva.habitaciones.map((h) => h.habitacion.numero).join(', ')}</td>
                <td>{formatearFecha(reserva.fechaLlegada)}</td>
                <td>{formatearFecha(reserva.fechaSalida)}</td>
                <td>
                  <EstadoReserva estado={reserva.estado} />
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td colSpan={6} className="tabla-vacia">
                  No hay reservas que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

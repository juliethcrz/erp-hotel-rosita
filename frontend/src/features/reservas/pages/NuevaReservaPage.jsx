import { ArrowLeft, ArrowRight, CalendarSearch } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertaError,
  Boton,
  Campo,
  EncabezadoPagina,
  FilaCampos,
  ListaValores,
  Modal,
  Tarjeta,
} from '../../../components/ui/index.js';
import { FormularioPagos } from '../../../components/FormularioPagos/FormularioPagos.jsx';
import { formatearFecha, formatearPesos, hoyLocal } from '../../../lib/formato.js';
import { BuscadorTitular } from '../components/BuscadorTitular/BuscadorTitular.jsx';
import { PasosReserva } from '../components/PasosReserva/PasosReserva.jsx';
import { SelectorHabitaciones } from '../components/SelectorHabitaciones/SelectorHabitaciones.jsx';
import { useNuevaReserva } from '../hooks/useNuevaReserva.js';
import { textoNoches } from '../utils/calcularTotales.js';
import estilos from './NuevaReservaPage.module.css';

export function NuevaReservaPage() {
  const navigate = useNavigate();
  const reserva = useNuevaReserva();
  const { paso, setPaso, fechas, setFechas, seleccion, titular, totales } = reserva;
  const [cobrandoAnticipo, setCobrandoAnticipo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  /** Ejecuta una acción mostrando el error en la página si falla. */
  const intentar = async (accion) => {
    setProcesando(true);
    setError(null);
    try {
      await accion();
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  const guardarYAbrir = async (pagos) => {
    const creada = await reserva.guardar(pagos);
    navigate(`/reservas/${creada.id}`);
  };

  return (
    <>
      <Boton variante="fantasma" tamano="sm" icono={ArrowLeft} to="/reservas">
        Reservas
      </Boton>
      <EncabezadoPagina titulo="Nueva reserva" />
      <PasosReserva actual={paso} />
      <AlertaError error={error} />

      {paso === 0 && (
        <Tarjeta className={estilos.angosta}>
          <form
            className={estilos.formulario}
            onSubmit={(evento) => {
              evento.preventDefault();
              intentar(reserva.buscarDisponibilidad);
            }}
          >
            <FilaCampos>
              <Campo etiqueta="Llegada">
                <input
                  type="date"
                  min={hoyLocal()}
                  value={fechas.llegada}
                  onChange={(e) => setFechas({ ...fechas, llegada: e.target.value })}
                  required
                />
              </Campo>
              <Campo etiqueta="Salida">
                <input
                  type="date"
                  min={fechas.llegada}
                  value={fechas.salida}
                  onChange={(e) => setFechas({ ...fechas, salida: e.target.value })}
                  required
                />
              </Campo>
            </FilaCampos>
            <Boton type="submit" variante="primario" icono={CalendarSearch} disabled={procesando}>
              Ver habitaciones disponibles
            </Boton>
          </form>
        </Tarjeta>
      )}

      {paso === 1 && (
        <>
          <p className={estilos.contexto}>
            {formatearFecha(fechas.llegada)} → {formatearFecha(fechas.salida)} ·{' '}
            {reserva.disponibles.length} habitaciones disponibles
          </p>
          <SelectorHabitaciones
            habitaciones={reserva.disponibles}
            cotizaciones={reserva.cotizaciones}
            seleccion={seleccion}
            onAlternar={reserva.alternarHabitacion}
          />
          <div className={estilos.navegacion}>
            <Boton icono={ArrowLeft} onClick={() => setPaso(0)}>
              Cambiar fechas
            </Boton>
            <Boton variante="primario" disabled={seleccion.length === 0} onClick={() => setPaso(2)}>
              Continuar con {seleccion.length}{' '}
              {seleccion.length === 1 ? 'habitación' : 'habitaciones'}
              <ArrowRight size={17} aria-hidden="true" />
            </Boton>
          </div>
        </>
      )}

      {paso === 2 && (
        <>
          <Tarjeta>
            <BuscadorTitular titular={titular} onSeleccionar={reserva.setTitular} />
          </Tarjeta>
          <div className={estilos.navegacion}>
            <Boton icono={ArrowLeft} onClick={() => setPaso(1)}>
              Volver
            </Boton>
            <Boton variante="primario" disabled={!titular} onClick={() => setPaso(3)}>
              Continuar <ArrowRight size={17} aria-hidden="true" />
            </Boton>
          </div>
        </>
      )}

      {paso === 3 && (
        <div className={estilos.confirmacion}>
          <Tarjeta titulo="Datos de la reserva">
            <ListaValores
              filas={[
                { etiqueta: 'Titular', valor: `${titular.nombres} ${titular.apellidos}` },
                {
                  etiqueta: 'Fechas',
                  valor: `${formatearFecha(fechas.llegada)} → ${formatearFecha(fechas.salida)} (${textoNoches(reserva.noches)})`,
                },
                ...reserva.elegidas.map((habitacion) => ({
                  etiqueta: `Habitación ${habitacion.numero}`,
                  valor: `${habitacion.tipo.nombre} · ${formatearPesos(reserva.cotizaciones[habitacion.tipoId].total)}`,
                })),
              ]}
            />
            <FilaCampos>
              <Campo etiqueta="Descuento sobre habitaciones (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={reserva.descuento}
                  onChange={(e) => reserva.setDescuento(e.target.value)}
                />
              </Campo>
              <Campo etiqueta="Observaciones">
                <input
                  value={reserva.observaciones}
                  onChange={(e) => reserva.setObservaciones(e.target.value)}
                />
              </Campo>
            </FilaCampos>
          </Tarjeta>

          <Tarjeta titulo="Total">
            <ListaValores
              filas={[
                { etiqueta: 'Habitaciones', valor: formatearPesos(totales.totalHabitaciones) },
                totales.descuento > 0 && {
                  etiqueta: 'Descuento',
                  valor: `−${formatearPesos(totales.descuento)}`,
                },
                {
                  etiqueta: 'Total estadía (IVA incluido)',
                  valor: formatearPesos(totales.totalEstadia),
                  total: true,
                },
                { etiqueta: 'Anticipo del 50 %', valor: formatearPesos(totales.anticipo) },
              ]}
            />
            <div className={estilos.botonesTotal}>
              <Boton variante="primario" ancho onClick={() => setCobrandoAnticipo(true)}>
                Cobrar anticipo y confirmar
              </Boton>
              <Boton ancho disabled={procesando} onClick={() => intentar(guardarYAbrir)}>
                Guardar sin anticipo
              </Boton>
              <Boton variante="fantasma" ancho icono={ArrowLeft} onClick={() => setPaso(2)}>
                Volver
              </Boton>
            </div>
          </Tarjeta>
        </div>
      )}

      {cobrandoAnticipo && (
        <Modal titulo="Cobrar anticipo" onCerrar={() => setCobrandoAnticipo(false)}>
          <FormularioPagos
            monto={totales.anticipo}
            textoBoton="Confirmar reserva"
            onConfirmar={guardarYAbrir}
            onCancelar={() => setCobrandoAnticipo(false)}
          />
        </Modal>
      )}
    </>
  );
}

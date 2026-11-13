import { useState } from 'react';
import { AlertaError, EncabezadoPagina, Modal } from '../../../components/ui/index.js';
import { cx } from '../../../lib/clases.js';
import { FormularioTerminar } from '../components/FormularioTerminar/FormularioTerminar.jsx';
import { TarjetaTarea } from '../components/TarjetaTarea/TarjetaTarea.jsx';
import { useLimpiezas } from '../hooks/useLimpiezas.js';
import estilos from './LimpiezaPage.module.css';

const COLUMNAS = [
  { estado: 'PENDIENTE', titulo: 'Pendientes' },
  { estado: 'EN_PROCESO', titulo: 'En proceso' },
  { estado: 'TERMINADA', titulo: 'Listas hoy' },
];

export function LimpiezaPage() {
  const { limpiezas, error, iniciar, terminar } = useLimpiezas();
  const [terminando, setTerminando] = useState(null);

  return (
    <>
      <EncabezadoPagina
        antetitulo="Housekeeping"
        titulo="Limpieza"
        descripcion="Las habitaciones llegan aquí solas cuando el huésped hace check-out."
      />
      <AlertaError error={error} />

      <div className={estilos.tablero}>
        {COLUMNAS.map(({ estado, titulo }) => {
          const tareas = limpiezas.filter((limpieza) => limpieza.estado === estado);
          return (
            <section key={estado} className={cx(estilos.columna, estilos[estado])}>
              <h2>
                {titulo}
                <span>{tareas.length}</span>
              </h2>
              {tareas.map((limpieza) => (
                <TarjetaTarea
                  key={limpieza.id}
                  limpieza={limpieza}
                  onIniciar={() => iniciar(limpieza)}
                  onTerminar={() => setTerminando(limpieza)}
                />
              ))}
              {tareas.length === 0 && <p className={estilos.vacia}>Sin habitaciones.</p>}
            </section>
          );
        })}
      </div>

      {terminando && (
        <Modal
          titulo={`Habitación ${terminando.habitacion.numero} lista`}
          onCerrar={() => setTerminando(null)}
        >
          <FormularioTerminar
            onConfirmar={async (observaciones) => {
              await terminar(terminando, observaciones);
              setTerminando(null);
            }}
            onCancelar={() => setTerminando(null)}
          />
        </Modal>
      )}
    </>
  );
}

import { LockKeyhole, Wallet } from 'lucide-react';
import { useState } from 'react';
import {
  AlertaError,
  Boton,
  EncabezadoPagina,
  EstadoVacio,
  Modal,
  PieFormulario,
  Tabla,
} from '../../../components/ui/index.js';
import { METODOS_PAGO } from '../../../constants/catalogos.js';
import { formatearFechaHora, formatearPesos } from '../../../lib/formato.js';
import { useAuth } from '../../auth/AuthContext.js';
import { ResumenCaja } from '../components/ResumenCaja/ResumenCaja.jsx';
import { useCaja } from '../hooks/useCaja.js';
import estilos from './CajaPage.module.css';

const COLUMNAS_MOVIMIENTOS = [
  { clave: 'hora', titulo: 'Hora', render: (m) => formatearFechaHora(m.creadoEn) },
  { clave: 'descripcion', titulo: 'Descripción' },
  { clave: 'metodo', titulo: 'Método', render: (m) => METODOS_PAGO[m.metodo] },
  { clave: 'usuario', titulo: 'Registró', render: (m) => m.usuario.nombre },
  {
    clave: 'monto',
    titulo: 'Valor',
    numero: true,
    render: (m) => (
      <span className={m.tipo === 'EGRESO' ? estilos.egreso : estilos.ingreso}>
        {m.tipo === 'EGRESO' ? '−' : '+'}
        {formatearPesos(m.monto)}
      </span>
    ),
  },
];

const COLUMNAS_HISTORIAL = [
  { clave: 'apertura', titulo: 'Apertura', render: (c) => formatearFechaHora(c.abiertaEn) },
  { clave: 'cierre', titulo: 'Cierre', render: (c) => formatearFechaHora(c.cerradaEn) },
  { clave: 'cerro', titulo: 'Cerró', render: (c) => c.cerradaPor?.nombre },
  {
    clave: 'ingresos',
    titulo: 'Ingresos',
    numero: true,
    render: (c) => formatearPesos(c.resumen.ingresos),
  },
  {
    clave: 'egresos',
    titulo: 'Egresos',
    numero: true,
    render: (c) => formatearPesos(c.resumen.egresos),
  },
  { clave: 'neto', titulo: 'Neto', numero: true, render: (c) => formatearPesos(c.resumen.neto) },
];

export function CajaPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'ADMIN';
  const { caja, historial, error, abrir, cerrar } = useCaja({ conHistorial: esAdmin });
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);
  const [cierre, setCierre] = useState(null);

  const confirmarCierre = async () => {
    setConfirmandoCierre(false);
    const resultado = await cerrar();
    if (resultado) setCierre(resultado);
  };

  return (
    <>
      <EncabezadoPagina
        antetitulo="Turno actual"
        titulo="Caja diaria"
        descripcion={
          caja
            ? `Abierta por ${caja.abiertaPor.nombre} · ${formatearFechaHora(caja.abiertaEn)}`
            : 'Cobros y movimientos del turno.'
        }
        acciones={
          caja && (
            <Boton icono={LockKeyhole} onClick={() => setConfirmandoCierre(true)}>
              Cerrar caja
            </Boton>
          )
        }
      />
      <AlertaError error={error} />

      {caja === null && (
        <EstadoVacio
          icono={Wallet}
          titulo="La caja está cerrada"
          descripcion="Ábrela con la base del día para empezar a registrar cobros de reservas y de la tienda."
          accion={
            <Boton variante="primario" onClick={abrir}>
              Abrir caja
            </Boton>
          }
        />
      )}

      {caja && (
        <div className={estilos.secciones}>
          <ResumenCaja caja={caja} />
          <section>
            <h2 className={estilos.subtitulo}>Movimientos</h2>
            <Tabla
              columnas={COLUMNAS_MOVIMIENTOS}
              filas={caja.movimientos}
              vacio="Aún no hay movimientos en este turno."
            />
          </section>
        </div>
      )}

      {esAdmin && historial.length > 0 && (
        <section className={estilos.historial}>
          <h2 className={estilos.subtitulo}>Cierres anteriores</h2>
          <Tabla columnas={COLUMNAS_HISTORIAL} filas={historial} />
        </section>
      )}

      {confirmandoCierre && (
        <Modal titulo="¿Cerrar la caja del turno?" onCerrar={() => setConfirmandoCierre(false)}>
          <p className={estilos.texto}>
            Después del cierre no se podrán registrar más cobros en esta caja.
          </p>
          <PieFormulario>
            <Boton onClick={() => setConfirmandoCierre(false)}>Cancelar</Boton>
            <Boton variante="primario" onClick={confirmarCierre}>
              Cerrar caja
            </Boton>
          </PieFormulario>
        </Modal>
      )}

      {cierre && (
        <Modal titulo="Resumen del cierre" ancho="lg" onCerrar={() => setCierre(null)}>
          <ResumenCaja caja={cierre} />
          <PieFormulario>
            <Boton variante="primario" onClick={() => setCierre(null)}>
              Listo
            </Boton>
          </PieFormulario>
        </Modal>
      )}
    </>
  );
}

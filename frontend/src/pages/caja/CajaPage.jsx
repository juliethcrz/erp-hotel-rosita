import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.js';
import { EncabezadoPagina } from '../../components/EncabezadoPagina.jsx';
import { MensajeError } from '../../components/MensajeError.jsx';
import { Modal } from '../../components/Modal.jsx';
import { METODOS_PAGO } from '../../constants/catalogos.js';
import { formatearFechaHora, formatearPesos } from '../../utils/formato.js';

function ResumenCaja({ caja }) {
  const { resumen } = caja;

  return (
    <>
      <section className="tarjetas-cifras">
        <div className="tarjeta-cifra">
          <span>Efectivo en caja</span>
          <strong>{formatearPesos(resumen.efectivoEnCaja)}</strong>
          <small>Incluye la base de {formatearPesos(caja.montoBase)}</small>
        </div>
        <div className="tarjeta-cifra">
          <span>Ingresos</span>
          <strong>{formatearPesos(resumen.ingresos)}</strong>
        </div>
        <div className="tarjeta-cifra">
          <span>Egresos</span>
          <strong>{formatearPesos(resumen.egresos)}</strong>
        </div>
        <div className="tarjeta-cifra">
          <span>Neto del turno</span>
          <strong>{formatearPesos(resumen.neto)}</strong>
        </div>
      </section>

      <h2 className="subtitulo">Por método de pago</h2>
      <div className="tabla-contenedor">
        <table className="tabla">
          <tbody>
            {Object.entries(resumen.porMetodo).map(([metodo, total]) => (
              <tr key={metodo}>
                <td>{METODOS_PAGO[metodo]}</td>
                <td className="celda-numero">{formatearPesos(total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CajaPage() {
  const { usuario } = useAuth();
  const [caja, setCaja] = useState(undefined);
  const [historial, setHistorial] = useState([]);
  const [cierre, setCierre] = useState(null);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const esAdmin = usuario.rol === 'ADMIN';

  const cargar = useCallback(() => {
    api.get('/caja/actual').then(setCaja).catch(setError);
    if (esAdmin) {
      api.get('/caja/historial').then(setHistorial).catch(setError);
    }
  }, [esAdmin]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ejecutar = async (accion) => {
    setProcesando(true);
    setError(null);
    try {
      await accion();
      cargar();
    } catch (err) {
      setError(err);
    } finally {
      setProcesando(false);
    }
  };

  const abrir = () => ejecutar(() => api.post('/caja/abrir'));

  const cerrar = () => {
    if (
      !window.confirm(
        '¿Cerrar la caja del turno? Después no se podrán registrar más cobros en ella.',
      )
    ) {
      return;
    }
    ejecutar(async () => setCierre(await api.post('/caja/cerrar')));
  };

  return (
    <>
      <EncabezadoPagina
        titulo="Caja diaria"
        descripcion="Cobros y movimientos del turno"
        acciones={
          caja && (
            <button type="button" className="boton" onClick={cerrar} disabled={procesando}>
              Cerrar caja
            </button>
          )
        }
      />
      <MensajeError error={error} />

      {caja === null && (
        <div className="tarjeta-vacia">
          <p>La caja está cerrada. Ábrala para empezar a registrar cobros.</p>
          <button
            type="button"
            className="boton boton-primario"
            onClick={abrir}
            disabled={procesando}
          >
            Abrir caja
          </button>
        </div>
      )}

      {caja && (
        <>
          <p className="texto-suave">
            Abierta por {caja.abiertaPor.nombre} el {formatearFechaHora(caja.abiertaEn)}
          </p>
          <ResumenCaja caja={caja} />

          <h2 className="subtitulo">Movimientos</h2>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Descripción</th>
                  <th>Método</th>
                  <th>Registró</th>
                  <th className="celda-numero">Valor</th>
                </tr>
              </thead>
              <tbody>
                {caja.movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td>{formatearFechaHora(movimiento.creadoEn)}</td>
                    <td>{movimiento.descripcion}</td>
                    <td>{METODOS_PAGO[movimiento.metodo]}</td>
                    <td>{movimiento.usuario.nombre}</td>
                    <td
                      className={`celda-numero ${movimiento.tipo === 'EGRESO' ? 'texto-egreso' : ''}`}
                    >
                      {movimiento.tipo === 'EGRESO' ? '−' : ''}
                      {formatearPesos(movimiento.monto)}
                    </td>
                  </tr>
                ))}
                {caja.movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="tabla-vacia">
                      Aún no hay movimientos en este turno.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {esAdmin && historial.length > 0 && (
        <>
          <h2 className="subtitulo">Cierres anteriores</h2>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Cerró</th>
                  <th className="celda-numero">Ingresos</th>
                  <th className="celda-numero">Egresos</th>
                  <th className="celda-numero">Neto</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((anterior) => (
                  <tr key={anterior.id}>
                    <td>{formatearFechaHora(anterior.abiertaEn)}</td>
                    <td>{formatearFechaHora(anterior.cerradaEn)}</td>
                    <td>{anterior.cerradaPor?.nombre}</td>
                    <td className="celda-numero">{formatearPesos(anterior.resumen.ingresos)}</td>
                    <td className="celda-numero">{formatearPesos(anterior.resumen.egresos)}</td>
                    <td className="celda-numero">{formatearPesos(anterior.resumen.neto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cierre && (
        <Modal titulo="Resumen del cierre de caja" onCerrar={() => setCierre(null)}>
          <ResumenCaja caja={cierre} />
          <div className="acciones-modal">
            <button type="button" className="boton boton-primario" onClick={() => setCierre(null)}>
              Listo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

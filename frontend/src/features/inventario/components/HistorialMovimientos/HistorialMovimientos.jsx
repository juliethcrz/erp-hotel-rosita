import { useEffect, useState } from 'react';
import { Tabla } from '../../../../components/ui/index.js';
import { formatearFechaHora } from '../../../../lib/formato.js';
import { inventarioApi } from '../../api/inventarioApi.js';
import estilos from './HistorialMovimientos.module.css';

const MOTIVOS = {
  COMPRA: 'Compra',
  VENTA: 'Venta en tienda',
  CONSUMO_HABITACION: 'Consumo de habitación',
  AJUSTE: 'Ajuste',
};

const COLUMNAS = [
  { clave: 'fecha', titulo: 'Fecha', render: (m) => formatearFechaHora(m.creadoEn) },
  { clave: 'motivo', titulo: 'Motivo', render: (m) => MOTIVOS[m.motivo] },
  {
    clave: 'cantidad',
    titulo: 'Cantidad',
    numero: true,
    render: (m) => (
      <span className={m.cantidad < 0 ? estilos.salida : estilos.entrada}>
        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
      </span>
    ),
  },
  { clave: 'stockResultante', titulo: 'Queda', numero: true },
  { clave: 'usuario', titulo: 'Usuario', render: (m) => m.usuario.nombre },
];

export function HistorialMovimientos({ productoId }) {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    inventarioApi.movimientos(productoId).then(setMovimientos);
  }, [productoId]);

  return <Tabla columnas={COLUMNAS} filas={movimientos} vacio="Sin movimientos." />;
}

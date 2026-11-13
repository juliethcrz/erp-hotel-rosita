import { Tabla } from '../../../../components/ui/index.js';
import { METODOS_PAGO, TIPOS_COBRO } from '../../../../constants/catalogos.js';
import { comprobante, formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';
import estilos from './TablaCobros.module.css';

const COLUMNAS = [
  { clave: 'comprobante', titulo: 'Comprobante', render: (v) => comprobante(v.id) },
  { clave: 'fecha', titulo: 'Fecha', render: (v) => formatearFechaHora(v.creadoEn) },
  {
    clave: 'concepto',
    titulo: 'Concepto',
    render: (v) => `${TIPOS_COBRO[v.tipo]}${v.estado === 'ANULADA' ? ' (devuelto)' : ''}`,
  },
  {
    clave: 'pago',
    titulo: 'Pago',
    render: (v) => v.pagos.map((pago) => METODOS_PAGO[pago.metodo]).join(' + '),
  },
  { clave: 'total', titulo: 'Valor', numero: true, render: (v) => formatearPesos(v.total) },
];

export function TablaCobros({ ventas }) {
  return (
    <Tabla
      columnas={COLUMNAS}
      filas={ventas}
      claseFila={(venta) => (venta.estado === 'ANULADA' ? estilos.anulada : undefined)}
    />
  );
}

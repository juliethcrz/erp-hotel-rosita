import { Tabla } from '../../../../components/ui/index.js';
import { formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';

const COLUMNAS = [
  { clave: 'id', titulo: 'N.º' },
  { clave: 'fecha', titulo: 'Fecha', render: (c) => formatearFechaHora(c.creadoEn) },
  { clave: 'proveedor', titulo: 'Proveedor', render: (c) => c.proveedor.nombre },
  {
    clave: 'productos',
    titulo: 'Productos',
    render: (c) => c.detalles.map((d) => `${d.cantidad} × ${d.producto.nombre}`).join(', '),
  },
  { clave: 'registro', titulo: 'Registró', render: (c) => c.creadoPor.nombre },
  { clave: 'total', titulo: 'Total', numero: true, render: (c) => formatearPesos(c.total) },
];

export function TablaCompras({ compras }) {
  return <Tabla columnas={COLUMNAS} filas={compras} vacio="Todavía no hay compras registradas." />;
}

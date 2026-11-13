import { Insignia, Tabla } from '../../../../components/ui/index.js';
import { formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';

const COLUMNAS = [
  { clave: 'fecha', titulo: 'Fecha', render: (c) => formatearFechaHora(c.creadoEn) },
  { clave: 'producto', titulo: 'Producto', render: (c) => c.producto.nombre },
  { clave: 'cantidad', titulo: 'Cantidad', numero: true },
  {
    clave: 'valor',
    titulo: 'Valor',
    numero: true,
    render: (c) => formatearPesos(c.cantidad * c.precioUnitario),
  },
  {
    clave: 'estado',
    titulo: 'Estado',
    render: (c) =>
      c.pagado ? (
        <Insignia tono="exito">Pagado</Insignia>
      ) : (
        <Insignia tono="aviso">En la cuenta</Insignia>
      ),
  },
];

export function TablaConsumos({ consumos }) {
  return <Tabla columnas={COLUMNAS} filas={consumos} />;
}

import { Wallet } from 'lucide-react';
import { Boton, ListaValores, Tarjeta } from '../../../../components/ui/index.js';
import { formatearFechaHora, formatearPesos } from '../../../../lib/formato.js';
import estilos from './PanelCaja.module.css';

export function PanelCaja({ caja }) {
  if (!caja) {
    return (
      <Tarjeta titulo="Caja">
        <p className={estilos.cerrada}>La caja está cerrada. Ábrela antes de registrar cobros.</p>
        <Boton variante="primario" icono={Wallet} to="/caja">
          Ir a caja
        </Boton>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta
      titulo="Caja abierta"
      acciones={
        <Boton tamano="sm" to="/caja">
          Ver detalle
        </Boton>
      }
    >
      <ListaValores
        filas={[
          { etiqueta: 'Abierta desde', valor: formatearFechaHora(caja.abiertaEn) },
          { etiqueta: 'Ingresos', valor: formatearPesos(caja.ingresos) },
          { etiqueta: 'Egresos', valor: formatearPesos(caja.egresos) },
          { etiqueta: 'Efectivo en caja', valor: formatearPesos(caja.efectivoEnCaja), total: true },
        ]}
      />
    </Tarjeta>
  );
}

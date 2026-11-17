import { ArrowDownLeft, ArrowUpRight, Banknote, Scale } from 'lucide-react';
import { Cifra, ListaValores, Tarjeta } from '../../../../components/ui/index.js';
import { METODOS_PAGO } from '../../../../constants/catalogos.js';
import { formatearPesos } from '../../../../lib/formato.js';
import estilos from './ResumenCaja.module.css';

export function ResumenCaja({ caja }) {
  const { resumen } = caja;

  return (
    <div className={estilos.resumen}>
      <div className={estilos.cifras}>
        <Cifra
          destacada
          etiqueta="Efectivo en caja"
          valor={formatearPesos(resumen.efectivoEnCaja)}
          detalle={`Incluye la base de ${formatearPesos(caja.montoBase)}`}
          icono={Banknote}
        />
        <Cifra etiqueta="Ingresos" valor={formatearPesos(resumen.ingresos)} icono={ArrowDownLeft} />
        <Cifra etiqueta="Egresos" valor={formatearPesos(resumen.egresos)} icono={ArrowUpRight} />
        <Cifra etiqueta="Neto del turno" valor={formatearPesos(resumen.neto)} icono={Scale} />
      </div>

      <Tarjeta titulo="Por método de pago">
        <ListaValores
          filas={Object.entries(resumen.porMetodo).map(([metodo, total]) => ({
            etiqueta: METODOS_PAGO[metodo],
            valor: formatearPesos(total),
          }))}
        />
      </Tarjeta>
    </div>
  );
}

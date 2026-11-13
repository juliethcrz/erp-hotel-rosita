import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Boton, Cifra } from '../../../../components/ui/index.js';
import { PanelLimpiezas } from '../PanelLimpiezas/PanelLimpiezas.jsx';
import estilos from '../dashboard.module.css';

export function VistaHousekeeping({ datos }) {
  const { limpiezas } = datos;

  return (
    <div className={estilos.vista}>
      <section className={estilos.cifras}>
        <Cifra
          destacada
          etiqueta="Por limpiar"
          valor={limpiezas.pendientes.length}
          detalle="Esperando que alguien las inicie"
          icono={Sparkles}
        />
        <Cifra etiqueta="En proceso" valor={limpiezas.enProceso.length} icono={Clock} />
        <Cifra etiqueta="Terminadas hoy" valor={limpiezas.terminadasHoy} icono={CheckCircle2} />
      </section>
      <PanelLimpiezas
        limpiezas={limpiezas}
        acciones={
          <Boton variante="primario" tamano="sm" to="/limpieza">
            Abrir tablero
          </Boton>
        }
      />
    </div>
  );
}

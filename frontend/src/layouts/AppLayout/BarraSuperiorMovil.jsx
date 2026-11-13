import { Hotel } from 'lucide-react';
import { CampanaNotificaciones } from '../../features/notificaciones/components/CampanaNotificaciones.jsx';
import estilos from './BarraSuperiorMovil.module.css';

export function BarraSuperiorMovil() {
  return (
    <header className={estilos.barra}>
      <span className={estilos.marca}>
        <Hotel size={20} />
        Hotel Rosita
      </span>
      <CampanaNotificaciones posicion="abajo" />
    </header>
  );
}

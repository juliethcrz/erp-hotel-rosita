import { Outlet } from 'react-router';
import { BarraLateral } from './BarraLateral.jsx';
import { BarraSuperiorMovil } from './BarraSuperiorMovil.jsx';
import { NavegacionMovil } from './NavegacionMovil.jsx';
import estilos from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={estilos.app}>
      <BarraLateral />
      <BarraSuperiorMovil />
      <main className={estilos.contenido}>
        <Outlet />
      </main>
      <NavegacionMovil />
    </div>
  );
}

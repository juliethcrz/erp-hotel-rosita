import { Hotel, LogOut } from 'lucide-react';
import { NavLink } from 'react-router';
import { menuPara } from '../../constants/navegacion.js';
import { ROLES } from '../../constants/catalogos.js';
import { useAuth } from '../../features/auth/AuthContext.js';
import { CampanaNotificaciones } from '../../features/notificaciones/components/CampanaNotificaciones.jsx';
import { cx } from '../../lib/clases.js';
import estilos from './BarraLateral.module.css';

export function BarraLateral() {
  const { usuario, logout } = useAuth();
  const iniciales = `${usuario.nombre[0]}${usuario.apellido[0]}`;

  return (
    <aside className={estilos.barra}>
      <div className={estilos.marca}>
        <span className={estilos.logo}>
          <Hotel size={20} />
        </span>
        <span className={estilos.nombre}>Hotel Rosita</span>
        <span className={estilos.campana}>
          <CampanaNotificaciones posicion="lateral" />
        </span>
      </div>

      <nav className={estilos.menu} aria-label="Menú principal">
        {menuPara(usuario.rol).map(({ ruta, etiqueta, icono: Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end={ruta === '/'}
            title={etiqueta}
            className={({ isActive }) => cx(estilos.enlace, isActive && estilos.activo)}
          >
            <Icono size={19} aria-hidden="true" />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      <div className={estilos.perfil}>
        <span className={estilos.avatar}>{iniciales}</span>
        <div className={estilos.datos}>
          <strong>
            {usuario.nombre} {usuario.apellido}
          </strong>
          <small>{ROLES[usuario.rol]}</small>
        </div>
        <button type="button" className={estilos.salir} onClick={logout} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

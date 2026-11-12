import { Hotel, LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { ROLES } from '../constants/catalogos.js';
import { MENU } from '../constants/navegacion.js';

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const opciones = MENU.filter((opcion) => !opcion.roles || opcion.roles.includes(usuario.rol));

  return (
    <div className="app">
      <aside className="barra-lateral">
        <div className="marca">
          <Hotel size={24} />
          <span>Hotel Rosita</span>
        </div>

        <nav className="menu">
          {opciones.map(({ ruta, etiqueta, icono: Icono }) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/'} className="menu-enlace">
              <Icono size={18} />
              <span>{etiqueta}</span>
            </NavLink>
          ))}
        </nav>

        <div className="perfil">
          <div>
            <strong>
              {usuario.nombre} {usuario.apellido}
            </strong>
            <small>{ROLES[usuario.rol]}</small>
          </div>
          <button type="button" className="boton-icono" onClick={logout} aria-label="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}

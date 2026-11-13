import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';
import { Modal } from '../../components/ui/index.js';
import { menuPara } from '../../constants/navegacion.js';
import { useAuth } from '../../features/auth/AuthContext.js';
import { cx } from '../../lib/clases.js';
import estilos from './NavegacionMovil.module.css';

const VISIBLES = 4;

export function NavegacionMovil() {
  const { usuario, logout } = useAuth();
  const [masAbierto, setMasAbierto] = useState(false);
  const opciones = menuPara(usuario.rol);
  const principales = opciones.slice(0, VISIBLES);
  const resto = opciones.slice(VISIBLES);

  const enlace = ({ ruta, etiqueta, icono: Icono }, alNavegar) => (
    <NavLink
      key={ruta}
      to={ruta}
      end={ruta === '/'}
      onClick={alNavegar}
      className={({ isActive }) => cx(estilos.enlace, isActive && estilos.activo)}
    >
      <Icono size={21} aria-hidden="true" />
      <span>{etiqueta}</span>
    </NavLink>
  );

  return (
    <>
      <nav className={estilos.navegacion} aria-label="Menú principal">
        {principales.map((opcion) => enlace(opcion))}
        <button type="button" className={estilos.enlace} onClick={() => setMasAbierto(true)}>
          <Menu size={21} aria-hidden="true" />
          <span>Más</span>
        </button>
      </nav>

      {masAbierto && (
        <Modal titulo="Menú" onCerrar={() => setMasAbierto(false)}>
          <div className={estilos.mas}>
            {resto.map((opcion) => enlace(opcion, () => setMasAbierto(false)))}
            <button type="button" className={estilos.enlace} onClick={logout}>
              <LogOut size={21} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

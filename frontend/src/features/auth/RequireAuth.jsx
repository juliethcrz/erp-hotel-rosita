import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext.js';
import estilos from './RequireAuth.module.css';

export function RequireAuth({ roles }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className={estilos.carga}>
        <span className={estilos.indicador} />
      </div>
    );
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

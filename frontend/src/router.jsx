import { Navigate, createBrowserRouter } from 'react-router';
import { RequireAuth } from './auth/RequireAuth.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ClientesPage } from './pages/clientes/ClientesPage.jsx';
import { RackPage } from './pages/habitaciones/RackPage.jsx';
import { UsuariosPage } from './pages/usuarios/UsuariosPage.jsx';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'habitaciones', element: <RackPage /> },
          {
            element: <RequireAuth roles={['ADMIN', 'RECEPCIONISTA']} />,
            children: [{ path: 'clientes', element: <ClientesPage /> }],
          },
          {
            element: <RequireAuth roles={['ADMIN']} />,
            children: [{ path: 'usuarios', element: <UsuariosPage /> }],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

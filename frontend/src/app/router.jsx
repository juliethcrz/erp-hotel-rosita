import { Navigate, createBrowserRouter } from 'react-router';
import { RequireAuth } from '../features/auth/RequireAuth.jsx';
import { LoginPage } from '../features/auth/pages/LoginPage.jsx';
import { CajaPage } from '../features/caja/pages/CajaPage.jsx';
import { ClientesPage } from '../features/clientes/pages/ClientesPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { RackPage } from '../features/habitaciones/pages/RackPage.jsx';
import { InventarioPage } from '../features/inventario/pages/InventarioPage.jsx';
import { LimpiezaPage } from '../features/limpieza/pages/LimpiezaPage.jsx';
import { NuevaReservaPage } from '../features/reservas/pages/NuevaReservaPage.jsx';
import { ReservaDetallePage } from '../features/reservas/pages/ReservaDetallePage.jsx';
import { ReportesPage } from '../features/reportes/pages/ReportesPage.jsx';
import { ReservasPage } from '../features/reservas/pages/ReservasPage.jsx';
import { TiendaPage } from '../features/tienda/pages/TiendaPage.jsx';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage.jsx';
import { AppLayout } from '../layouts/AppLayout/AppLayout.jsx';

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
            children: [
              { path: 'reservas', element: <ReservasPage /> },
              { path: 'reservas/nueva', element: <NuevaReservaPage /> },
              { path: 'reservas/:id', element: <ReservaDetallePage /> },
              { path: 'tienda', element: <TiendaPage /> },
              { path: 'inventario', element: <InventarioPage /> },
              { path: 'caja', element: <CajaPage /> },
              { path: 'clientes', element: <ClientesPage /> },
            ],
          },
          {
            element: <RequireAuth roles={['HOUSEKEEPING', 'ADMIN']} />,
            children: [{ path: 'limpieza', element: <LimpiezaPage /> }],
          },
          {
            element: <RequireAuth roles={['ADMIN']} />,
            children: [
              { path: 'usuarios', element: <UsuariosPage /> },
              { path: 'reportes', element: <ReportesPage /> },
            ],
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

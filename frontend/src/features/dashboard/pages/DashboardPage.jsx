import { LayoutDashboard } from 'lucide-react';
import { AlertaError, EncabezadoPagina, EstadoVacio } from '../../../components/ui/index.js';
import { saludoSegunHora } from '../../../lib/formato.js';
import { useAuth } from '../../auth/AuthContext.js';
import { VistaAdmin } from '../components/VistaAdmin/VistaAdmin.jsx';
import { VistaHousekeeping } from '../components/VistaHousekeeping/VistaHousekeeping.jsx';
import { VistaRecepcion } from '../components/VistaRecepcion/VistaRecepcion.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

const VISTAS = {
  ADMIN: { componente: VistaAdmin, descripcion: 'Así va el hotel hoy.' },
  RECEPCIONISTA: { componente: VistaRecepcion, descripcion: 'Llegadas, salidas y caja del día.' },
  HOUSEKEEPING: { componente: VistaHousekeeping, descripcion: 'Habitaciones por preparar.' },
};

export function DashboardPage() {
  const { usuario } = useAuth();
  const { datos, error } = useDashboard();
  const { componente: Vista, descripcion } = VISTAS[usuario.rol];

  return (
    <>
      <EncabezadoPagina
        antetitulo={saludoSegunHora()}
        titulo={usuario.nombre}
        descripcion={descripcion}
      />
      <AlertaError error={error} />
      {datos ? (
        <Vista datos={datos} />
      ) : (
        !error && <EstadoVacio icono={LayoutDashboard} titulo="Cargando el resumen del día…" />
      )}
    </>
  );
}

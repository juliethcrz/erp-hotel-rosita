import {
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

export const MENU = [
  { ruta: '/', etiqueta: 'Inicio', icono: LayoutDashboard },
  { ruta: '/habitaciones', etiqueta: 'Habitaciones', icono: BedDouble },
  {
    ruta: '/reservas',
    etiqueta: 'Reservas',
    icono: CalendarDays,
    roles: ['ADMIN', 'RECEPCIONISTA'],
  },
  { ruta: '/limpieza', etiqueta: 'Limpieza', icono: Sparkles, roles: ['HOUSEKEEPING', 'ADMIN'] },
  { ruta: '/caja', etiqueta: 'Caja', icono: Wallet, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: UserCog, roles: ['ADMIN'] },
];

import {
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  Package,
  ShoppingCart,
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
  { ruta: '/tienda', etiqueta: 'Tienda', icono: ShoppingCart, roles: ['ADMIN', 'RECEPCIONISTA'] },
  {
    ruta: '/inventario',
    etiqueta: 'Inventario',
    icono: Package,
    roles: ['ADMIN', 'RECEPCIONISTA'],
  },
  { ruta: '/caja', etiqueta: 'Caja', icono: Wallet, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, roles: ['ADMIN', 'RECEPCIONISTA'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: UserCog, roles: ['ADMIN'] },
];

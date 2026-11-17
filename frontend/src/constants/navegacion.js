import {
  BarChart3,
  BedDouble,
  CalendarDays,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

const RECEPCION = ['ADMIN', 'RECEPCIONISTA'];

export const MENU = [
  { ruta: '/', etiqueta: 'Inicio', icono: LayoutDashboard },
  { ruta: '/habitaciones', etiqueta: 'Habitaciones', icono: BedDouble },
  { ruta: '/reservas', etiqueta: 'Reservas', icono: CalendarDays, roles: RECEPCION },
  { ruta: '/limpieza', etiqueta: 'Limpieza', icono: Sparkles, roles: ['HOUSEKEEPING', 'ADMIN'] },
  { ruta: '/tienda', etiqueta: 'Tienda', icono: ShoppingBag, roles: RECEPCION },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: Package, roles: RECEPCION },
  { ruta: '/caja', etiqueta: 'Caja', icono: Wallet, roles: RECEPCION },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, roles: RECEPCION },
  { ruta: '/reportes', etiqueta: 'Reportes', icono: BarChart3, roles: ['ADMIN'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: UserCog, roles: ['ADMIN'] },
];

export function menuPara(rol) {
  return MENU.filter((opcion) => !opcion.roles || opcion.roles.includes(rol));
}

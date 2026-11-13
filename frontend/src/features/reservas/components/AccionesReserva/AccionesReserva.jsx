import { LogIn, LogOut, ShoppingBag, Wallet, X, UserX } from 'lucide-react';
import { Boton } from '../../../../components/ui/index.js';
import estilos from './AccionesReserva.module.css';

/** Botones disponibles según el estado de la reserva. */
export function AccionesReserva({ estado, onAccion }) {
  return (
    <div className={estilos.acciones}>
      {estado === 'PENDIENTE' && (
        <Boton variante="primario" icono={Wallet} onClick={() => onAccion('anticipo')}>
          Registrar anticipo
        </Boton>
      )}
      {estado === 'CONFIRMADA' && (
        <>
          <Boton variante="primario" icono={LogIn} onClick={() => onAccion('checkin')}>
            Hacer check-in
          </Boton>
          <Boton icono={UserX} onClick={() => onAccion('no-show')}>
            Marcar no-show
          </Boton>
        </>
      )}
      {['PENDIENTE', 'CONFIRMADA'].includes(estado) && (
        <Boton variante="fantasma" icono={X} onClick={() => onAccion('cancelar')}>
          Cancelar reserva
        </Boton>
      )}
      {estado === 'EN_CURSO' && (
        <>
          <Boton icono={ShoppingBag} onClick={() => onAccion('consumo')}>
            Cargar consumo
          </Boton>
          <Boton variante="primario" icono={LogOut} onClick={() => onAccion('checkout')}>
            Hacer check-out
          </Boton>
        </>
      )}
    </div>
  );
}

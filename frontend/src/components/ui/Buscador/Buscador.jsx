import { Search } from 'lucide-react';
import estilos from './Buscador.module.css';

export function Buscador({ valor, onCambiar, placeholder }) {
  return (
    <label className={estilos.buscador}>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={valor}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(evento) => onCambiar(evento.target.value)}
      />
    </label>
  );
}

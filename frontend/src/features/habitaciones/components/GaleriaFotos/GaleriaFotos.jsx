import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import estilos from './GaleriaFotos.module.css';

/** Fotos de la portada de la ficha; la principal se muestra primero. */
export function GaleriaFotos({ fotos, numero }) {
  const ordenadas = [...fotos].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal));
  const [indice, setIndice] = useState(0);
  const actual = Math.min(indice, ordenadas.length - 1);
  const ir = (paso) => setIndice((actual + paso + ordenadas.length) % ordenadas.length);

  return (
    <div className={estilos.galeria}>
      <img
        key={ordenadas[actual].id}
        src={ordenadas[actual].url}
        alt={`Habitación ${numero}, foto ${actual + 1} de ${ordenadas.length}`}
      />
      {ordenadas.length > 1 && (
        <>
          <button
            type="button"
            className={`${estilos.flecha} ${estilos.anterior}`}
            onClick={() => ir(-1)}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={`${estilos.flecha} ${estilos.siguiente}`}
            onClick={() => ir(1)}
            aria-label="Foto siguiente"
          >
            <ChevronRight size={20} />
          </button>
          <span className={estilos.contador}>
            {actual + 1} / {ordenadas.length}
          </span>
        </>
      )}
    </div>
  );
}

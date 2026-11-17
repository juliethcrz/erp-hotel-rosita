import estilos from './PieFormulario.module.css';

export function PieFormulario({ children }) {
  return <div className={estilos.pie}>{children}</div>;
}

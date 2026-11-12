import { Hotel } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { MensajeError } from '../components/MensajeError.jsx';

export function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const actualizar = (evento) => {
    setCredenciales({ ...credenciales, [evento.target.name]: evento.target.value });
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(credenciales.email, credenciales.password);
      navigate(location.state?.desde ?? '/', { replace: true });
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <form className="login-tarjeta" onSubmit={enviar}>
        <div className="login-marca">
          <Hotel size={32} />
          <h1>Hotel Rosita</h1>
          <p>Sistema de gestión hotelera</p>
        </div>

        <MensajeError error={error} />

        <label className="campo">
          <span>Correo electrónico</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={credenciales.email}
            onChange={actualizar}
            required
          />
        </label>

        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={credenciales.password}
            onChange={actualizar}
            required
          />
        </label>

        <button type="submit" className="boton boton-primario" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

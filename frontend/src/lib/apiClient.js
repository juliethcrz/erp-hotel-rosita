const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

let accessToken = null;
let alExpirarSesion = () => {};
let renovacionEnCurso = null;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function setAccessToken(token) {
  accessToken = token;
}

export function onSesionExpirada(callback) {
  alExpirarSesion = callback;
}

export function renovarSesion() {
  renovacionEnCurso ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (respuesta) => {
      if (!respuesta.ok) return null;
      const sesion = await respuesta.json();
      accessToken = sesion.accessToken;
      return sesion;
    })
    .catch(() => null)
    .finally(() => {
      renovacionEnCurso = null;
    });

  return renovacionEnCurso;
}

async function solicitar(ruta, { method = 'GET', body, reintentar = true } = {}) {
  const esFormulario = body instanceof FormData;
  const headers = {};
  if (body !== undefined && !esFormulario) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined || esFormulario ? body : JSON.stringify(body),
  });

  if (respuesta.status === 401 && reintentar && !ruta.startsWith('/auth/')) {
    const sesion = await renovarSesion();
    if (sesion) return solicitar(ruta, { method, body, reintentar: false });
    alExpirarSesion();
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ApiError(
      datos?.error?.message ?? 'No se pudo completar la solicitud',
      respuesta.status,
      datos?.error?.details,
    );
  }

  return datos;
}

export const api = {
  get: (ruta) => solicitar(ruta),
  post: (ruta, body = {}) => solicitar(ruta, { method: 'POST', body }),
  patch: (ruta, body) => solicitar(ruta, { method: 'PATCH', body }),
  delete: (ruta) => solicitar(ruta, { method: 'DELETE' }),
};

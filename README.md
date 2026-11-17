# ERP Hotel Rosita

Sistema de gestión para el Hotel y Restaurante Rosita (Chiscas, Boyacá). Reúne en una sola aplicación web las reservas, el check-in y el check-out, el estado de las habitaciones, la tienda del hotel, el inventario, la caja diaria, la limpieza y los reportes del negocio.

Proyecto formativo de la Tecnología en Análisis y Desarrollo de Software, SENA, ficha 2758274.

## Funcionalidades

| Módulo              | Qué resuelve                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Habitaciones        | Rack del día con el estado de las 20 habitaciones (disponible, reservada, ocupada, en limpieza, en mantenimiento) y ficha de cada una con fotos, camas, descripción y comodidades |
| Reservas            | Reserva en cuatro pasos con tarifa calculada noche a noche según la temporada, anticipo del 50 %, check-in, consumos cargados a la habitación, check-out, cancelación y no-show   |
| Tienda              | Venta de productos empacados a personas de paso o con cargo a la cuenta de un huésped                                                                                             |
| Inventario          | Productos, ajustes de stock, compras al proveedor, historial de movimientos y aviso de stock bajo                                                                                 |
| Caja                | Apertura y cierre del turno; cada cobro queda registrado por método de pago (efectivo, Nequi, Daviplata, Bancolombia, transferencia)                                              |
| Limpieza            | Al hacer check-out la habitación pasa sola a limpieza y housekeeping recibe la tarea; al terminarla, recepción recibe el aviso                                                    |
| Reportes            | Ingresos, ocupación y caja por periodo, con exportación a PDF y Excel                                                                                                             |
| Inicio              | Resumen del día según el rol: negocio completo, operación de recepción o tablero de housekeeping                                                                                  |
| Clientes y usuarios | Registro de huéspedes y administración de cuentas del personal                                                                                                                    |

### Roles

| Rol           | Acceso                                                                               |
| ------------- | ------------------------------------------------------------------------------------ |
| Administrador | Todo el sistema, incluidos reportes, usuarios, mantenimiento de habitaciones y fotos |
| Recepcionista | Reservas, tienda, inventario, caja y clientes                                        |
| Housekeeping  | Tablero de limpieza y rack de habitaciones                                           |

## Tecnologías

| Capa          | Tecnología                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Frontend      | React 19, Vite, React Router, CSS Modules                                   |
| Backend       | Node.js 24, Express 5                                                       |
| Base de datos | PostgreSQL 18, Prisma 7                                                     |
| Autenticación | JWT de corta duración con refresh token rotativo en cookie httpOnly, bcrypt |
| Validación    | Zod                                                                         |
| Archivos      | Supabase Storage (fotos), PDFKit y ExcelJS (reportes)                       |
| Pruebas       | Test runner de Node.js y Supertest                                          |
| Calidad       | ESLint y Prettier                                                           |

## Arquitectura

Monorepo con dos espacios de trabajo de npm.

```
erp-hotel-rosita/
├── backend/
│   ├── prisma/            Esquema, migraciones y datos iniciales
│   ├── scripts/           Datos de demostración e importación de fotos
│   ├── src/
│   │   ├── config/        Variables de entorno, base de datos y almacenamiento
│   │   ├── middlewares/   Autenticación, roles, validación y manejo de errores
│   │   ├── modules/       Un módulo por dominio: rutas, controlador, servicio y esquemas
│   │   └── shared/        Utilidades, catálogos y esquemas comunes
│   └── test/              Pruebas de integración
├── frontend/
│   └── src/
│       ├── app/           Rutas y permisos por rol
│       ├── components/ui/ Librería de componentes reutilizables
│       ├── features/      Un módulo por dominio: api, hooks, components, pages y utils
│       ├── layouts/       Estructura general (barra lateral, navegación móvil)
│       ├── lib/           Cliente de la API y formatos
│       └── styles/        Tokens de diseño y estilos base
└── docs/                  Documentación técnica
```

En el backend cada petición pasa por **rutas → validación → controlador → servicio**. Las rutas definen permisos y esquemas, el controlador solo traduce HTTP y el servicio contiene las reglas del negocio. En el frontend cada componente separa su estructura (`.jsx`) de sus estilos (`.module.css`), y la comunicación con la API vive en `api/` y `hooks/`.

### Decisiones técnicas

- **Dinero en pesos enteros.** Los precios incluyen el IVA del 19 %; la base y el impuesto se descomponen al cobrar.
- **Cobros atómicos.** Cada cobro crea la venta, sus pagos y los movimientos de caja dentro de una misma transacción; la suma de los pagos debe ser exacta.
- **Estado calculado.** "Reservada" no se guarda en la habitación: se deduce de las reservas activas del día, para que nunca quede desactualizado.
- **Stock sin carreras.** El descuento de inventario se hace con una condición dentro del mismo `UPDATE`, así dos ventas simultáneas no pueden dejarlo en negativo.
- **Sesiones seguras.** El token de acceso dura 15 minutos y vive solo en memoria; del refresh token solo se guarda su hash, rota en cada uso y, si se reutiliza uno ya usado, se cierran todas las sesiones del usuario.
- **Hora de Colombia.** Fechas y horas se calculan y muestran en `America/Bogota`, sin depender de la zona del servidor o del equipo.

## Requisitos

- Node.js 24 LTS
- PostgreSQL 18
- Git
- Una cuenta de Supabase con un bucket público para las fotos (opcional; sin él, el sistema funciona sin fotos)

## Instalación

```bash
git clone https://github.com/juliethcrz/erp-hotel-rosita.git
cd erp-hotel-rosita
npm install
cp backend/.env.example backend/.env
```

Edite `backend/.env` con los datos de su equipo:

| Variable                                                       | Descripción                                         |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`                                                 | Conexión a PostgreSQL                               |
| `JWT_ACCESS_SECRET`                                            | Clave para firmar los tokens (mínimo 32 caracteres) |
| `SEED_PASSWORD`                                                | Contraseña de los usuarios iniciales                |
| `CORS_ORIGIN`                                                  | Dirección del frontend                              |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` | Almacenamiento de fotos                             |

Cree la base de datos y cargue los datos iniciales:

```bash
npm run db:migrate -w backend
npm run db:seed -w backend
```

Opcionalmente, registre las fotos del bucket y cargue datos de demostración (reservas, cobros y movimientos desde el 1 de octubre):

```bash
npm run fotos:importar -w backend
npm run db:demo -w backend
```

## Ejecución en desarrollo

En dos terminales, desde la raíz del proyecto:

```bash
npm run dev:api   # API en http://localhost:3000
npm run dev:web   # Interfaz en http://localhost:5173
```

Usuarios iniciales: `admin@hotelrosita.co`, `recepcion@hotelrosita.co` y `limpieza@hotelrosita.co`, con la contraseña definida en `SEED_PASSWORD`.

## Pruebas

Las pruebas de integración recorren la API real contra una base exclusiva, que se borra en cada ejecución. Solo corren si el nombre de la base termina en `_test`.

```bash
cp backend/.env.test.example backend/.env.test   # ajustar la contraseña
npm run test:preparar -w backend                  # aplica las migraciones
npm run test -w backend
```

Cubren autenticación y renovación de sesión, permisos por rol, el ciclo completo de una reserva, la cancelación con devolución, la venta de mostrador y la consistencia de los reportes.

## Scripts

| Comando                               | Uso                                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| `npm run dev:api` / `npm run dev:web` | Levantar la API y la interfaz                                  |
| `npm run lint` / `npm run format`     | Revisar y formatear el código                                  |
| `npm run db:migrate -w backend`       | Crear o aplicar migraciones                                    |
| `npm run db:seed -w backend`          | Cargar usuarios, habitaciones, productos y temporadas          |
| `npm run db:reset -w backend`         | Borrar la base y volver a aplicar las migraciones              |
| `npm run db:demo -w backend`          | Cargar datos de demostración                                   |
| `npm run fotos:importar -w backend`   | Registrar fotos subidas al bucket con la convención `101P.jpg` |
| `npm run test -w backend`             | Ejecutar las pruebas                                           |

## API

Todas las rutas parten de `/api` y, salvo el inicio de sesión, requieren el encabezado `Authorization: Bearer <token>`.

| Recurso           | Operaciones principales                                            |
| ----------------- | ------------------------------------------------------------------ |
| `/auth`           | Iniciar sesión, renovar, cerrar sesión, perfil                     |
| `/habitaciones`   | Rack, disponibilidad por fechas, cambio de estado, fotos           |
| `/tarifas`        | Cotización por tipo y fechas, temporadas                           |
| `/reservas`       | Crear, anticipo, check-in, consumos, check-out, cancelar, no-show  |
| `/clientes`       | Buscar, crear y actualizar huéspedes                               |
| `/tienda`         | Venta de mostrador                                                 |
| `/inventario`     | Productos, ajustes, movimientos, categorías, proveedores y compras |
| `/caja`           | Turno actual, abrir, cerrar e historial                            |
| `/limpiezas`      | Tareas pendientes, iniciar y terminar                              |
| `/notificaciones` | Avisos por rol                                                     |
| `/reportes`       | Ingresos, ocupación y caja; exportación a PDF y Excel              |
| `/dashboard`      | Resumen del día según el rol                                       |
| `/usuarios`       | Administración de cuentas                                          |

Los errores responden con `{ "error": { "message", "details" } }` y el código HTTP correspondiente (400 datos inválidos, 401 sin sesión, 403 sin permiso, 404 no existe, 409 conflicto con una regla del negocio).

## Seguridad

| Riesgo               | Medida                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Robo de contraseñas  | Hash con bcrypt; los usuarios iniciales no aceptan claves débiles en producción                                                                            |
| Robo de sesión       | Token de acceso de 15 minutos solo en memoria; refresh token en cookie `httpOnly`, `Secure` y `SameSite=Strict`, rotativo y con detección de reutilización |
| Fuerza bruta         | 10 intentos de inicio de sesión cada 15 minutos por IP y límite general de solicitudes a la API                                                            |
| Acceso indebido      | Autenticación y rol revisados en cada ruta del backend; la interfaz solo oculta, no protege                                                                |
| Datos maliciosos     | Validación con Zod de cuerpo, parámetros y consulta; Prisma parametriza todas las consultas                                                                |
| Inyección de scripts | React escapa el contenido y la API envía una política de contenido (CSP) que solo permite recursos propios y las fotos del almacenamiento                  |
| Archivos             | Solo imágenes JPG, PNG o WebP de máximo 5 MB, subidas por el administrador a través de la API                                                              |
| Secretos             | Variables de entorno validadas al arrancar; en producción se rechazan claves de ejemplo y orígenes sin HTTPS. Ningún secreto vive en el repositorio        |
| Errores              | Los errores internos responden un mensaje genérico, sin detalles del servidor                                                                              |

## Despliegue

En producción un solo servicio compila la interfaz y la entrega desde la misma dirección que la API. Así la cookie de sesión nunca sale del dominio.

```
Navegador ──► Render (web + API, HTTPS)
                 ├──► Supabase PostgreSQL
                 └──► Supabase Storage (fotos)
```

El archivo [`render.yaml`](render.yaml) describe el servicio. En cada cambio a la rama `main`, Render instala las dependencias, genera el cliente de Prisma, aplica las migraciones pendientes, compila la interfaz y arranca la API. El estado del servicio se vigila con `/api/health`.

1. **Base de datos.** En Supabase, copie la cadena de conexión _Session pooler_ (Connect → Session pooler). En _Project Settings → Data API_, desactive la API de datos o quite el esquema `public` de los esquemas expuestos: el sistema accede a la base solo a través de su propia API.
2. **Servicio.** En Render, cree un _Blueprint_ desde este repositorio y complete `DATABASE_URL`, `CORS_ORIGIN` (la dirección pública del servicio), `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. `JWT_ACCESS_SECRET` se genera solo.
3. **Datos iniciales.** Desde un equipo con el proyecto, copie `backend/.env.produccion.example` como `backend/.env.produccion`, complételo y ejecute:

   ```bash
   npm run prod:seed -w backend
   npm run prod:fotos -w backend
   ```

   Para un ambiente de demostración, agregue `npm run prod:demo -w backend`. En un hotel real no se cargan datos de demostración.

4. **Primer ingreso.** Entre con `admin@hotelrosita.co` y cambie las contraseñas iniciales desde _Usuarios_.

## Limitaciones conocidas

- Dos reservas creadas exactamente al mismo tiempo para la misma habitación no se bloquean a nivel de base de datos; con una sola recepción el riesgo es mínimo.
- Las tarifas por temporada se cargan desde los datos iniciales; aún no tienen pantalla de administración.

## Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, con el módulo entre paréntesis cuando aplica, por ejemplo `feat(reservas): registra el check-in`.

## Autora

Lidya Julieth Lozano Cruz

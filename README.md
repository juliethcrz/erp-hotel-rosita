# ERP Hotel Rosita

Sistema de gestión para el Hotel y Restaurante Rosita (Chiscas, Boyacá). Centraliza reservas, check-in y check-out, control de habitaciones, tienda del hotel, inventario y caja diaria en una aplicación web.

Proyecto formativo de la Tecnología en Análisis y Desarrollo de Software, SENA, ficha 2758274.

## Stack

| Capa          | Tecnología                                                 |
| ------------- | ---------------------------------------------------------- |
| Frontend      | React + Vite + React Router                                |
| Backend       | Node.js 24 + Express                                       |
| Base de datos | PostgreSQL 18 + Prisma                                     |
| Autenticación | JWT con refresh token, bcrypt, control de acceso por roles |
| Validación    | Zod                                                        |
| Pruebas       | Jest + Supertest (backend), Vitest (frontend)              |

## Estructura

```
erp-hotel-rosita/
├── backend/     API REST
├── frontend/    Interfaz web
└── docs/        Documentación técnica
```

## Requisitos

- Node.js 24 LTS
- PostgreSQL 18
- Git

## Instalación local

```bash
git clone https://github.com/juliethcrz/erp-hotel-rosita.git
cd erp-hotel-rosita
npm install
cp backend/.env.example backend/.env
```

Para levantar el proyecto en desarrollo:

```bash
npm run dev:api   # API en http://localhost:3000
npm run dev:web   # Interfaz en http://localhost:5173
```

## Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, con el módulo entre paréntesis cuando aplica, por ejemplo `feat(reservas): registra el check-in`.

## Autora

Lidya Julieth Lozano Cruz

# Documentación técnica

## Modelo de datos

El esquema completo está en [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma). Son 29 tablas, agrupadas por módulo:

| Módulo        | Tablas                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Seguridad     | `usuarios`, `refresh_tokens`                                                                                                |
| Huéspedes     | `clientes`                                                                                                                  |
| Habitaciones  | `tipos_habitacion`, `habitaciones`, `camas_habitacion`, `caracteristicas`, `habitacion_caracteristicas`, `fotos_habitacion` |
| Tarifas       | `temporadas`, `tarifas_temporada`                                                                                           |
| Reservas      | `reservas`, `reserva_habitaciones`, `reserva_huespedes`, `consumos_habitacion`                                              |
| Inventario    | `categorias`, `productos`, `proveedores`, `compras`, `compra_detalles`, `movimientos_inventario`                            |
| Ventas y caja | `ventas`, `venta_detalles`, `venta_pagos`, `cajas`, `caja_movimientos`                                                      |
| Operación     | `limpiezas`, `notificaciones`, `configuracion`                                                                              |

Relaciones que conviene tener presentes:

- Una reserva tiene un titular y una o varias habitaciones; cada habitación reservada guarda su tarifa por noche y su subtotal, para que un cambio de precios no altere reservas ya hechas.
- Toda venta pertenece al turno de caja en que se cobró. Sus pagos generan los movimientos de caja, y sus productos generan los movimientos de inventario.
- El stock de un producto siempre coincide con el último `stock_resultante` de su historial de movimientos.
- `habitacion_caracteristicas` es la tabla puente de la relación muchos a muchos entre habitaciones y comodidades.

## Reglas de negocio

| Regla                               | Valor                                                         |
| ----------------------------------- | ------------------------------------------------------------- |
| Anticipo para confirmar una reserva | 50 % del total de la estadía                                  |
| Devolución del anticipo al cancelar | Solo con más de 24 horas antes de la hora de check-in (14:00) |
| Temporada alta                      | +30 % sobre la tarifa base                                    |
| IVA                                 | 19 %, incluido en los precios                                 |
| Duración del token de acceso        | 15 minutos                                                    |
| Cierre de sesión por inactividad    | 15 minutos                                                    |

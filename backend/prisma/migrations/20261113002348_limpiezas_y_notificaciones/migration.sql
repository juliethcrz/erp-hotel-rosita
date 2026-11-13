/*
  Warnings:

  - Added the required column `subtotal` to the `reserva_habitaciones` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoLimpieza" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'TERMINADA');

-- AlterTable
ALTER TABLE "reserva_habitaciones" ADD COLUMN     "subtotal" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "limpiezas" (
    "id" SERIAL NOT NULL,
    "habitacion_id" INTEGER NOT NULL,
    "reserva_id" INTEGER,
    "estado" "EstadoLimpieza" NOT NULL DEFAULT 'PENDIENTE',
    "responsable_id" INTEGER,
    "observaciones" TEXT,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iniciada_en" TIMESTAMP(3),
    "terminada_en" TIMESTAMP(3),

    CONSTRAINT "limpiezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "rol_destino" "Rol" NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "habitacion_id" INTEGER,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "leida_por_id" INTEGER,
    "leida_en" TIMESTAMP(3),
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "limpiezas_estado_idx" ON "limpiezas"("estado");

-- CreateIndex
CREATE INDEX "limpiezas_habitacion_id_idx" ON "limpiezas"("habitacion_id");

-- CreateIndex
CREATE INDEX "notificaciones_rol_destino_leida_idx" ON "notificaciones"("rol_destino", "leida");

-- AddForeignKey
ALTER TABLE "limpiezas" ADD CONSTRAINT "limpiezas_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limpiezas" ADD CONSTRAINT "limpiezas_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limpiezas" ADD CONSTRAINT "limpiezas_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_leida_por_id_fkey" FOREIGN KEY ("leida_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

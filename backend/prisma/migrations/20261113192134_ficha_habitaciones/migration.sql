-- CreateEnum
CREATE TYPE "TipoCama" AS ENUM ('SENCILLA', 'SEMIDOBLE', 'DOBLE', 'QUEEN', 'CAMAROTE');

-- CreateEnum
CREATE TYPE "CategoriaCaracteristica" AS ENUM ('VISTA', 'BANO', 'TECNOLOGIA', 'MOBILIARIO', 'COMODIDAD');

-- AlterTable
ALTER TABLE "habitaciones" ADD COLUMN     "nombre" VARCHAR(60);

-- CreateTable
CREATE TABLE "camas_habitacion" (
    "id" SERIAL NOT NULL,
    "habitacion_id" INTEGER NOT NULL,
    "tipo" "TipoCama" NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "camas_habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristicas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,
    "categoria" "CategoriaCaracteristica" NOT NULL,

    CONSTRAINT "caracteristicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habitacion_caracteristicas" (
    "habitacion_id" INTEGER NOT NULL,
    "caracteristica_id" INTEGER NOT NULL,

    CONSTRAINT "habitacion_caracteristicas_pkey" PRIMARY KEY ("habitacion_id","caracteristica_id")
);

-- CreateTable
CREATE TABLE "fotos_habitacion" (
    "id" SERIAL NOT NULL,
    "habitacion_id" INTEGER NOT NULL,
    "ruta" VARCHAR(255) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "camas_habitacion_habitacion_id_tipo_key" ON "camas_habitacion"("habitacion_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristicas_nombre_key" ON "caracteristicas"("nombre");

-- CreateIndex
CREATE INDEX "habitacion_caracteristicas_caracteristica_id_idx" ON "habitacion_caracteristicas"("caracteristica_id");

-- CreateIndex
CREATE INDEX "fotos_habitacion_habitacion_id_idx" ON "fotos_habitacion"("habitacion_id");

-- AddForeignKey
ALTER TABLE "camas_habitacion" ADD CONSTRAINT "camas_habitacion_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitacion_caracteristicas" ADD CONSTRAINT "habitacion_caracteristicas_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habitacion_caracteristicas" ADD CONSTRAINT "habitacion_caracteristicas_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "caracteristicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_habitacion" ADD CONSTRAINT "fotos_habitacion_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "habitaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `genere_id` on table `libri` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipo_condivisione_id` on table `libri` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "libri" ALTER COLUMN "genere_id" SET NOT NULL,
ALTER COLUMN "tipo_condivisione_id" SET NOT NULL;

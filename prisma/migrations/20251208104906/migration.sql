/*
  Warnings:

  - A unique constraint covering the columns `[dettagli]` on the table `generi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "idx_genere_dettagli" ON "generi"("dettagli");

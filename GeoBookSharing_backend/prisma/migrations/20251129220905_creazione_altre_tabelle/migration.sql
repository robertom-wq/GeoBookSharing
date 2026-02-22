CREATE EXTENSION IF NOT EXISTS postgis;
-- CreateTable
CREATE TABLE "scaffali" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(300) NOT NULL,
    "descrizione" VARCHAR(1000),
    "proprietario_id" INTEGER NOT NULL,
    "posizione" geography NOT NULL,
    "data_creazione" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "data_ultima_modifica" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "scaffali_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_scaffali_posizione" ON "scaffali" USING GIST ("posizione");

-- CreateIndex
CREATE UNIQUE INDEX "idx_scaffali_proprietario_id_nome" ON "scaffali"("proprietario_id", "nome");

-- AddForeignKey
ALTER TABLE "libri" ADD CONSTRAINT "libri_scaffale_id_fkey" FOREIGN KEY ("scaffale_id") REFERENCES "scaffali"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scaffali" ADD CONSTRAINT "scaffali_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

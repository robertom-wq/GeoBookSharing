-- AlterTable
ALTER TABLE "libri" ALTER COLUMN "data_creazione" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "libri_master" (
    "id" SERIAL NOT NULL,
    "titolo" VARCHAR(300) NOT NULL,
    "autore" VARCHAR(1000) NOT NULL DEFAULT 'Sconosciuto',
    "anno" INTEGER,
    "isbn" VARCHAR(20) NOT NULL,
    "descrizione" VARCHAR(2000),
    "copertina" VARCHAR(1000),
    "copertina_thumb" VARCHAR(1000),
    "genere_id" INTEGER DEFAULT 999,
    "data_creazione" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_aggiornamento" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "libri_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipi_condivisione" (
    "id" SERIAL NOT NULL,
    "dettagli" VARCHAR(100),
    "descrizione" VARCHAR(2000),

    CONSTRAINT "tipi_condivisione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generi" (
    "id" SERIAL NOT NULL,
    "dettagli" VARCHAR(100) NOT NULL,

    CONSTRAINT "generi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "libri_master_isbn_key" ON "libri_master"("isbn");

-- CreateIndex
CREATE INDEX "libri_master_titolo_idx" ON "libri_master"("titolo");

-- CreateIndex
CREATE INDEX "libri_master_autore_idx" ON "libri_master"("autore");

-- CreateIndex
CREATE INDEX "libri_master_isbn_idx" ON "libri_master"("isbn");

-- CreateIndex
CREATE INDEX "libri_master_genere_id_idx" ON "libri_master"("genere_id");

-- CreateIndex
CREATE UNIQUE INDEX "libri_master_titolo_autore_anno_key" ON "libri_master"("titolo", "autore", "anno");

-- CreateIndex
CREATE UNIQUE INDEX "idx_tipo_condivisione_dettagli" ON "tipi_condivisione"("dettagli");

-- CreateIndex
CREATE INDEX "libri_titolo_idx" ON "libri"("titolo");

-- CreateIndex
CREATE INDEX "libri_autore_idx" ON "libri"("autore");

-- AddForeignKey
ALTER TABLE "libri_master" ADD CONSTRAINT "libri_master_genere_id_fkey" FOREIGN KEY ("genere_id") REFERENCES "generi"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "libri" ADD CONSTRAINT "libri_genere_id_fkey" FOREIGN KEY ("genere_id") REFERENCES "generi"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "libri" ADD CONSTRAINT "libri_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "libri" ADD CONSTRAINT "libri_tipo_condivisione_id_fkey" FOREIGN KEY ("tipo_condivisione_id") REFERENCES "tipi_condivisione"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "libri" ADD CONSTRAINT "libri_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "libri_master"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

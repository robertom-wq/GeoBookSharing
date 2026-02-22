-- CreateTable
CREATE TABLE "libri" (
    "id" SERIAL NOT NULL,
    "titolo" VARCHAR(300) NOT NULL,
    "autore" VARCHAR(1000) NOT NULL DEFAULT 'Sconosciuto',
    "anno" INTEGER,
    "copertina" VARCHAR(1000),
    "copertina_thumb" VARCHAR(1000),
    "descrizione" VARCHAR(2000),
    "genere_id" INTEGER DEFAULT 999,
    "tipo_condivisione_id" INTEGER DEFAULT 999,
    "proprietario_id" INTEGER NOT NULL,
    "scaffale_id" INTEGER NOT NULL,
    "is_disponibile" BOOLEAN NOT NULL DEFAULT true,
    "data_creazione" TIMESTAMP(6),
    "data_ultima_modifica" TIMESTAMP(6) NOT NULL,
    "master_id" INTEGER,

    CONSTRAINT "libri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_libri_disponibili" ON "libri"("is_disponibile");

-- CreateIndex
CREATE INDEX "idx_libri_filtri" ON "libri"("genere_id", "tipo_condivisione_id");

-- CreateIndex
CREATE INDEX "idx_libri_prorprietario" ON "libri"("proprietario_id");

-- CreateIndex
CREATE INDEX "idx_libri_scaffale" ON "libri"("scaffale_id");

-- CreateIndex
CREATE INDEX "idx_utenti_bannato" ON "utenti"("bannato");

-- CreateIndex
CREATE INDEX "idx_utenti_ruolo" ON "utenti"("ruolo");

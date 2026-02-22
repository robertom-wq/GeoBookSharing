-- CreateEnum
CREATE TYPE "TipiAzione" AS ENUM ('DELETE_UTENTE', 'DELETE_LIBRO', 'DELETE_SCAFFALE', 'DELETE_CONDIVISIONE', 'DELETE_VALUTAZIONE', 'BAN_UTENTE', 'MODIFICA_RUOLO');

-- AlterTable
ALTER TABLE "libri" ADD COLUMN     "visualizzazioni" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "utenti" ADD COLUMN     "visualizzazioni" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "condivisioni" (
    "id" SERIAL NOT NULL,
    "libro_id" INTEGER NOT NULL,
    "proprietario_id" INTEGER NOT NULL,
    "richiedente_id" INTEGER NOT NULL,
    "tipo_condivisione_id" INTEGER NOT NULL,
    "data_dal" DATE,
    "data_al" DATE,
    "note" VARCHAR(1000),
    "is_confermato" BOOLEAN NOT NULL DEFAULT false,
    "is_completato" BOOLEAN NOT NULL DEFAULT false,
    "data_creazione" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_completato" TIMESTAMP(6) NOT NULL,
    "data_ultima_modifica" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "condivisioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utente_valutazioni" (
    "id" SERIAL NOT NULL,
    "voto" INTEGER NOT NULL,
    "recensione" VARCHAR(1000),
    "data_creazione" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recensore_id" INTEGER NOT NULL,
    "recensito_id" INTEGER NOT NULL,
    "condivisione_id" INTEGER NOT NULL,

    CONSTRAINT "utente_valutazioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storico_utente_valutazioni" (
    "id" SERIAL NOT NULL,
    "voto" INTEGER NOT NULL,
    "recensione" VARCHAR(1000),
    "recensore_username" VARCHAR(100) NOT NULL,
    "recensito_username" VARCHAR(100) NOT NULL,
    "data_creazione" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storico_utente_valutazioni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storico_eliminazioni" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esecutore_id" INTEGER NOT NULL,
    "esecutore_username" VARCHAR(100) NOT NULL,
    "target_ID" INTEGER NOT NULL,
    "target_nome" VARCHAR(100) NOT NULL,
    "azione" "TipiAzione" NOT NULL,
    "dettagli" VARCHAR(1000),

    CONSTRAINT "storico_eliminazioni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_condivisioni_completato" ON "condivisioni"("is_completato");

-- CreateIndex
CREATE INDEX "idx_condivisioni_confermato" ON "condivisioni"("is_confermato");

-- CreateIndex
CREATE INDEX "idx_condivisioni_date" ON "condivisioni"("data_dal", "data_al");

-- CreateIndex
CREATE INDEX "idx_condivisioni_proprietario" ON "condivisioni"("proprietario_id");

-- CreateIndex
CREATE INDEX "idx_condivisioni_richiedente" ON "condivisioni"("richiedente_id");

-- CreateIndex
CREATE INDEX "idx_condivisioni_tipocondivisione" ON "condivisioni"("tipo_condivisione_id");

-- CreateIndex
CREATE INDEX "utente_valutazioni_recensito_id_idx" ON "utente_valutazioni"("recensito_id");

-- CreateIndex
CREATE INDEX "utente_valutazioni_recensore_id_idx" ON "utente_valutazioni"("recensore_id");

-- CreateIndex
CREATE UNIQUE INDEX "utente_valutazioni_condivisione_id_recensore_id_recensito_i_key" ON "utente_valutazioni"("condivisione_id", "recensore_id", "recensito_id");

-- CreateIndex
CREATE INDEX "storico_utente_valutazioni_recensito_username_idx" ON "storico_utente_valutazioni"("recensito_username");

-- CreateIndex
CREATE INDEX "storico_utente_valutazioni_recensore_username_idx" ON "storico_utente_valutazioni"("recensore_username");

-- CreateIndex
CREATE INDEX "storico_eliminazioni_azione_idx" ON "storico_eliminazioni"("azione");

-- CreateIndex
CREATE INDEX "storico_eliminazioni_esecutore_username_idx" ON "storico_eliminazioni"("esecutore_username");

-- CreateIndex
CREATE INDEX "storico_eliminazioni_azione_target_nome_idx" ON "storico_eliminazioni"("azione", "target_nome");

-- CreateIndex
CREATE INDEX "idx_utenti_richiesta_eliminazione" ON "utenti"("richiesta_eliminazione");

-- AddForeignKey
ALTER TABLE "condivisioni" ADD CONSTRAINT "condivisioni_libro_id_fkey" FOREIGN KEY ("libro_id") REFERENCES "libri"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "condivisioni" ADD CONSTRAINT "condivisioni_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "condivisioni" ADD CONSTRAINT "condivisioni_richiedente_id_fkey" FOREIGN KEY ("richiedente_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "condivisioni" ADD CONSTRAINT "condivisioni_tipo_condivisione_id_fkey" FOREIGN KEY ("tipo_condivisione_id") REFERENCES "tipi_condivisione"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "utente_valutazioni" ADD CONSTRAINT "utente_valutazioni_recensore_id_fkey" FOREIGN KEY ("recensore_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "utente_valutazioni" ADD CONSTRAINT "utente_valutazioni_recensito_id_fkey" FOREIGN KEY ("recensito_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "utente_valutazioni" ADD CONSTRAINT "utente_valutazioni_condivisione_id_fkey" FOREIGN KEY ("condivisione_id") REFERENCES "condivisioni"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

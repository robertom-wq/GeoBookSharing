/*
  Warnings:

  - You are about to drop the `Utenti` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Utenti";

-- CreateTable
CREATE TABLE "utenti" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cognome" VARCHAR(100) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "biografia" VARCHAR(1000) NOT NULL,
    "avatar" VARCHAR(1000),
    "avatar_thumb" VARCHAR(1000),
    "bannato" BOOLEAN NOT NULL DEFAULT false,
    "data_creazione" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ruolo" VARCHAR(50) NOT NULL DEFAULT 'user',
    "richiesta_eliminazione" BOOLEAN DEFAULT false,
    "data_richiesta_eliminazione" TIMESTAMP(6),
    "data_ultima_modifica" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "utenti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_utenti_username" ON "utenti"("username");

-- CreateIndex
CREATE UNIQUE INDEX "idx_utenti_email" ON "utenti"("email");

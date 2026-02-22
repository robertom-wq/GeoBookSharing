-- CreateTable
CREATE TABLE "Utenti" (
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

    CONSTRAINT "Utenti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_utenti_username" ON "Utenti"("username");

-- CreateIndex
CREATE UNIQUE INDEX "idx_utenti_email" ON "Utenti"("email");

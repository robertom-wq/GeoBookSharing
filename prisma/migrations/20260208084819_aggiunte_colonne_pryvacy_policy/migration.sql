-- AlterTable
ALTER TABLE "utenti" ADD COLUMN     "data_accettazione_privacy" TIMESTAMP(6),
ADD COLUMN     "privacy_policy_accettata" BOOLEAN NOT NULL DEFAULT false;

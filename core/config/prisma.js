/*
Questo modulo è stato creato per evitare di avere numerose istanze di PrismaClient. Seguendo il pattern
singleton, viene creta una sola istanza per collegarsi al database. 
*/

import { PrismaClient } from '@prisma/client'

// Variabile per l'istanza globale
let prisma;

if (process.env.NODE_ENV === 'production') {
  // In produzione, creiamo una singola istanza permanente
  prisma = new PrismaClient();
} else {
  // In sviluppo, usiamo una cache globale per prevenire la creazione di nuove istanze
  // ad ogni ricaricamento a caldo (hot reload) del server.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
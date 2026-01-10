/*
Questo modulo è stato creato per evitare di avere numerose istanze di PrismaClient. Seguendo il pattern
singleton, viene creta una sola istanza per collegarsi al database. 
*/

import { PrismaClient } from '@prisma/client'

// Variabile per l'istanza globale
let prisma

if (process.env.NODE_ENV === 'production') {
  // In produzione, creo una singola istanza permanente. il server parte una volta sola e non si riavvia a ogni modifica
  prisma = new PrismaClient()
} else {
  //in fase di sviluppo, controllo se esiste già un'istanza nell'oggetto globale.
  if (!global.prisma) {
    //se non esiste, presumibilmente prima esecuzione, la creo e la metto in attesa
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

//Rend0 l'unica istanza disponibile a tutto il resto dell'app.
export default prisma
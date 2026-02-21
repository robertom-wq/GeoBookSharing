# immagine Node.js come ambiente per installare le dipendenze e generare Prisma Client
FROM node:lts-slim as builder

WORKDIR /usr/src/app

# Copia i file delle dipendenze
COPY package*.json ./

# Installa le dipendenze
# Nota: L'installazione avviene qui. Grazie al Bind Mount nel docker-compose.yml,
# useremo questa cartella node_modules installata nel container anche se il codice sorgente
# cambia (Live Reload).
RUN npm install

# ----------------------------------------------------------------------------------

FROM node:lts-slim

WORKDIR /usr/src/app

# Copia solo le dipendenze e il codice dalla fase di build
# Il codice verrà sovrascritto dal Bind Mount (Live Reload)
COPY --from=builder /usr/src/app/node_modules ./node_modules

# ESPOSIZIONE E AVVIO
EXPOSE 3000

# Se stai usando nodemon (o un altro tool di watch) per il Live Reload,
# devi installarlo come dipendenza di sviluppo nel tuo package.json.
# Il comando di avvio dovrebbe puntare al tuo script di sviluppo.
# Esempio tipico con nodemon:
CMD [ "npm", "run", "dev" ] 

# Assicurati che nel tuo package.json (nella cartella backend) tu abbia:
# "scripts": {
#   "dev": "nodemon src/index.js" 
# }
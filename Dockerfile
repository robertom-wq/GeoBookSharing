FROM node:22-slim

# Installa OpenSSL
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copia i file manifest
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia la cartella prisma e genera il client per Linux
COPY prisma ./prisma/
RUN npx prisma generate

# Copia il resto del codice
COPY . .

EXPOSE 3000

# Avvio con nodemon
CMD [ "npm", "run", "dev" ]
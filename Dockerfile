# Usa Node 18 su Alpine
FROM node:22-slim

WORKDIR /usr/src/app

# Copia i file dei pacchetti
COPY package*.json ./

# Installa le dipendenze (Naive UI, Pinia, ecc.)
RUN npm install

# Copia il resto del codice sorgente
COPY . .

# Espone la porta di Vite
EXPOSE 5173

# CMD fondamentale: aggiungiamo --host per rendere accessibile Vite fuori dal container
# e --port per forzare la 5173 definita nel compose
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
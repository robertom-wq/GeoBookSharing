# GeoBookSharing

**GeoBookSharing** è una WebApp progettata per favorire la condivisione "peer-to-peer" del patrimonio librario privato. Il sistema sfrutta la geolocalizzazione per connettere utenti residenti in prossimità, permettendo lo scambio di libri basato sulla posizione geografica reale.

---

## Tecnologie Utilizzate

### Frontend

* **Vue.js 3** (Composition API)
* **Pinia** (State Management)
* **Naive UI** (Libreria Componenti)
* **Leaflet** (Mappe interattive)
* **Vite** (Build tool)

### Backend

* **Node.js & Express**
* **Prisma ORM**
* **PostgreSQL** con estensione **PostGIS** (Dati spaziali)

### Infrastructure

* **Docker & Docker Compose**

---

## Requisiti Minimi

Per eseguire l'intero ecosistema su un nuovo PC, non è necessario installare Node.js o PostgreSQL. È richiesto solo:

* **Docker Desktop** (per Windows o Mac) oppure **Docker Engine** (per Linux).

---

## Guida all'avvio rapido

Segui questi passaggi per configurare l'ambiente in pochi minuti:

1. **Clona il progetto o copia la cartella:**
```bash
git clone <url-del-repo>
cd GeoBookSharing

```

2. **Rinomina i file .env_example e aggiungere chiave API nel file GeoBookSharing_backend/.env :**
- GeoBookSharing_backend/.env_example ->  GeoBookSharing_backend/.env
- GeoBookSharing_frontend_vue/.env_example ->  GeoBookSharing_frontend_vue/.env
- Aggiungere chiave API fornita nell'elaborato all'interno di GeoBookSharing_backend/.env

3. **Avvia i container con build automatica:**
```bash
docker-compose up --build

```


*Nota: Durante il primo avvio, Docker scaricherà le immagini, installerà le dipendenze (npm install) e popolerà il database.*
4. **Accedi ai servizi:**
* **App Frontend:** [http://localhost:5173](http://localhost:5173)
* **API Backend:** [http://localhost:3000]



---

## Database e Persistenza

Il database viene inizializzato automaticamente grazie allo script contenuto nella cartella `db-init/`.

* **Inizializzazione:** Al primo avvio, lo script `init.sql` crea le tabelle, abilita PostGIS e inserisce i dati di test (Libri e Utenti con coordinate geografiche).
* **Persistenza:** I dati rimangono salvati anche se i container vengono fermati, grazie al volume Docker `geobook_data`.

### Come resettare il database

Se si desidera eliminare tutte le modifiche e tornare ai dati iniziali di test:

```bash
docker-compose down -v
docker-compose up

```

*(Il comando `down -v` distrugge il volume dei dati, forzando Docker a rieseguire lo script SQL di inizializzazione).*

---

## Struttura della Repository

```text
.
├── GeoBookSharing_backend/       # Server Express, Prisma Schema e Logica
├── GeoBookSharing_frontend_vue/  # Web App Vue 3 con Pinia e Naive UI
├── db-init/                      # Script SQL per il popolamento automatico (init.sql)
├── docker-compose.yml            # Orchestrazione di Database, Backend e Frontend
└── README.md                     # Documentazione del progetto

```

---

## 👤 Autore

* **Roberto Marongiu**

---

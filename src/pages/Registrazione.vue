<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- intestazione della pagina di registrazione -->
            <div class="intestazione">

                <!-- Titolo principale -->
                <h1>Registrati</h1>

                <!-- Sottotitolo -->
                <p class="sottotitolo">Benvenuto, crea un account ed inizia subito a condividere i tuoi libri con
                    GeoBookSharing</p>
            </div>

            <!-- Contenitore della card di registrazione -->
            <div class="contenuto_modulo">

                <!-- card naive che racchiude il form di registrazione -->
                <n-card title="Registrati" class="scheda_registrazione">

                    <!-- form naive collegato al modello form_value -->
                    <n-form :model="form_value" @submit.prevent="gestisciRegistrazione" :rules="rules">
                        <!-- Campo Nome -->
                        <n-form-item label="Nome" path="nome">
                            <n-input v-model:value="form_value.nome" placeholder="Nome" />
                        </n-form-item>
                        <!-- Campo Cognome -->
                        <n-form-item label="Cognome" path="cognome">
                            <n-input v-model:value="form_value.cognome" placeholder="Cognome" />
                        </n-form-item>
                        <!-- Campo Email -->
                        <n-form-item label="Email" path="email">
                            <n-input v-model:value="form_value.email" placeholder="Email" type="email" />
                        </n-form-item>
                        <!-- Campo Username -->
                        <n-form-item label="Username" path="username">
                            <n-input v-model:value="form_value.username" placeholder="Username" />
                        </n-form-item>
                        <!-- Campo Password -->
                        <n-form-item>
                            <n-input v-model:value="form_value.password" type="password" placeholder="Password" />
                        </n-form-item>
                        <n-form-item>
                            <div class="pulsanti_azione">
                                <NButton attr-type="submit" type="primary" :loading="utenti_store.loading">
                                    Registrati
                                </NButton>
                            </div>

                        </n-form-item>
                    </n-form>
                </n-card>

            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUtentiStore } from '@/stores/utentiStore'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const message = useMessage() 

// Store e router
const router = useRouter()
const utenti_store = useUtentiStore()

// Modello
const form_value = ref({
  nome: '',
  cognome: '',
  username: '',
  email: '',
  password: ''
})

// Regole di validazione
const rules = {
  nome: { required: true, message: 'Nome obbligatorio', trigger: 'blur' },
  cognome: { required: true, message: 'Cognome obbligatorio', trigger: 'blur' },
  username: { required: true, message: 'Username obbligatorio', trigger: 'blur' },
  email: [
    { required: true, message: 'Email obbligatoria', trigger: 'blur' },
    { type: 'email', message: 'Email non valida', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password obbligatoria', trigger: 'blur' },
    //limite 6 caratteri come imposto nel validator del backend
    { min: 6, message: 'Minimo 6 caratteri', trigger: 'blur' }
  ]
}

async function gestisciRegistrazione() {
    try {
        //Tento la registrazione sul server.
        await utenti_store.registrati(form_value.value)
        //console.log(JSON.stringify(form_value.value))
    } catch (err) {
        message.error(err.message || 'Errore durante la registrazione')
        console.error('Errore registrazione:', err)
        return
    }
    try {
        //Non uso Promise.all() in quanto le due chiamate sono dipendenti e quindi ho bisogno di sequenzialita
        //Se va bene, tenta subito il login
        await utenti_store.login(form_value.value.username, form_value.value.password)
        //recupero dati utente completi per lo store globale
        await utenti_store.getUtente()
        message.success('Benvenuto su GeoBookSharing! Registrazione e login effettuati con successo!')
        router.push('/profilo')
    } catch (err){
        message.error(err.message || 'Registrazione effettuata, ma il login automatico è fallito. Prova ad accedere manualmente.')
        console.error('Errore login automatico:', err)
    } 
}
</script>

<style scoped>

/* Contenitore div del modulo per la centratura */
.contenuto_modulo {
    display: flex; /* attiva il layout flex */
    flex-direction: column; /* dispone gli elementi in colonna */
    align-items: center; /* centra verticalmente */
    justify-content: center; /* centra orizzontalmente */
    min-height: 60vh; /* occupa almeno il 60% dell'altezza dello schermo */
}

/* La Scheda di Registrazione */
.scheda_registrazione {
    max-width: clamp(18.75rem, 90vw, 31.25rem);/* Larghezza fluida: non supera i 500px ma occupa il 95% su schermi piccoli */
    margin: 3rem auto;  /* Centratura con margini in rem */
    padding: clamp(1rem, 5vw, 2rem); /* padding che si adatta alla larghezza dello schermo */
    
    /* Utilizzo variabili globali */
    background-color: var(--pearl-white-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);

}

.n-button {
    min-width: 7rem; /* assicura che il bottone non sia troppo stretto */
}

.pulsanti_azione {
    width: 100%; /* occupa tutta la larghezza disponibile */
    display: flex; /* attivo flexbox per gestire i bottoni interni */
}

/*centratura titolo della card */
:deep(.n-card > .n-card-header) {
    text-align: center; 
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {

    .scheda_registrazione {
        margin: 1.5rem auto;/* riduce i margini verticali su mobile */
        padding: 1rem;/* riduce lo spazio interno della card */
    }

    /* input più grandi per il touch */
    :deep(.n-input) {
        height: 2.5rem;/* rende la casella di testo piu alta per il touch */
        font-size: small;/* riduce leggermente la dimensione del font */
    }
    
    :deep(.n-card__content) {
        padding: 0 /* azzero il padding della card in modo da predere piu spazio laterale possibile */
    }

    .pulsanti_azione {
        flex-direction: column;/* bottoni uno sopra l'altro su mobile */
    }

    .n-button {
        font-size: 1.2rem; /* dimensione testo e altezza bottone aumentati per migliorare esperienza con touch */
        height: 2.3rem;
    }
    
    .contenuto_modulo  {
        padding: 0 0rem;/* rimuovo il padding laterale per aumentare spazio disponibile*/
        
    }
}


</style>
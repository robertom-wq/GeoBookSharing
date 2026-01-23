<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- intestazione della pagina di login -->
            <div class="intestazione">

                <!-- Titolo principale -->
                <h1>Login</h1>

                <!-- Sottotitolo -->
                <p class="sottotitolo">Benvenuto, accedi per entrare nel mondo di GeoBookshelf e condividere i tuoi
                    libri</p>
            </div>
            <!-- Contenitore della card del login -->
            <div class="contenuto_pagina">

                <!-- card naive che racchiude il form di login -->
                <n-card title="Accedi" class="scheda_login">

                    <!-- form naive collegato al modello form_value -->
                    <n-form :model="form_value" @submit.prevent="gestisci_login" :rules="rules">

                        <!-- Campo Username -->
                        <n-form-item label="Username" path="username">
                            <n-input round v-model:value="form_value.username" placeholder="Username" />
                        </n-form-item>

                        <!-- Campo password -->
                        <n-form-item label="Password" path="password">
                            <n-input round v-model:value="form_value.password" type="password" placeholder="Password" />
                        </n-form-item>
                        <n-form-item>
                            <div class="pulsanti_azione">
                                <NButton attr-type="submit" type="primary" :loading="utenti_store.loading">
                                    Login
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
import { ref } from 'vue';
import { useUtentiStore } from '@/stores/utentiStore';
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const utenti_store = useUtentiStore()
const router = useRouter()
const message = useMessage()

// Modello
const form_value = ref({
    username: '',
    password: ''
})

// Regole di validazione
const rules = {
    username: [
        { required: true, message: "Username obbligatorio", trigger: "blur" }
    ],
    password: [
        { required: true, message: "Password obbligatoria", trigger: "blur" }
    ]
}

async function gestisci_login() {
    // se i campi sono vuoti non effettuo neanche la chiamata API
    if (!form_value.value.username || !form_value.value.password) return;

    try {
        // Passo le credenziali allo store che gestisce la fetch e i cookie/token
        await utenti_store.login(form_value.value.username, form_value.value.password)

        // Dopo il login, popolo lo store con i dati dell'utente 
        await utenti_store.getUtente()
        message.success('Login effettuato con successo!')
        router.push('/')
    } catch (err) {
        message.error(err.message || 'Credenziali non valide o errore di rete')
        console.error("Errore durante il login:", err)

    }
}
</script>

<style scoped>
.scheda_login {
    max-width: clamp(18.75rem, 90vw, 31.25rem);/* Larghezza fluida: min 300px, ideale 90%, max 500px */    
    margin: 3rem auto; /* Centratura con margini in rem */
    padding: clamp(1rem, 5vw, 2rem); /* Spaziatura interna fluida */

    /* Utilizzo variabili globali */
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    background-color: var(--pearl-white-bg);
}

.contenuto_pagina {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    /* Centra verticalmente il form nella viewport */
    padding: 0 1rem;
}

.n-button {
    min-width: 7rem;
}

.pulsanti_azione {
    width: 100%;
    display: flex;
}


:deep(.n-card > .n-card-header) {
    text-align: center; 
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .scheda_login {
        margin: 1.5rem auto;
        padding: 1rem;
    }

    /* input più grandi per il touch */
    :deep(.n-input) {
        height: 2.5rem; 
        font-size: small;
    }

    :deep(.n-card__content) {
        padding: 0 /* azzero il padding della card in modo da predere piu spazio laterale possibile */
    }

    .pulsanti_azione {
        flex-direction: column;
    }

    .n-button {
        font-size: 1.2rem; /* dimensione testo e altezza bottone aumentati per migliorare esperienza con touch */
        height: 2.3rem;
    }
    
    .contenuto_pagina  {
        padding: 0 0rem;
    }

}
</style>

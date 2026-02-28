<template>
    <div class="page">
        <section>
            <div class="intestazione">
                <h1>Login</h1>
                <p class="sottotitolo">Benvenuto, accedi per entrare nel mondo di GeoBookshelf e condividere i tuoi
                    libri</p>
            </div>
            <div class="contenuto_modulo">

                <n-form :model="form_data" ref="form_ref" :rules="rules" @submit.prevent="validaEInvia">
                    <n-card title="Accedi" class="scheda_login">
                        <n-form-item label="Username" path="username">
                            <n-input round v-model:value="form_data.username" placeholder="Username" />
                        </n-form-item>
                        <n-form-item label="Password" path="password">
                            <n-input round v-model:value="form_data.password" type="password" placeholder="Password" />
                        </n-form-item>
                    </n-card>
                    <div class="pulsanti_azione">
                        <NButton attr-type="submit" type="primary" ghost :loading="utenti_store.loading">
                            Login
                        </NButton>

                    </div>
                </n-form>

            </div>

        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUtentiStore } from '@/stores/utentiStore'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const utenti_store = useUtentiStore()
const router = useRouter()
const message = useMessage()

const form_ref = ref(null);

// Modello
const form_data = ref({
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

async function validaEInvia() {
    try {
        // Forza la validazione delle rules di Naive UI
        await form_ref.value?.validate();

        await gestisciLogin();

    } catch (err) {
        message.error(err.message || 'Errore durante la validazione')
        console.warn("Errori di validazione:", err);
    }
}

async function gestisciLogin() {
    // se i campi sono vuoti non effettuo neanche la chiamata API
    if (!form_data.value.username || !form_data.value.password) return

    try {
        //Non uso Promise.all() in quanto le due chiamate sono dipendenti e quindi ho bisogno di sequenzialita
        // Passo le credenziali allo store che gestisce la fetch e i cookie/token
        await utenti_store.login(form_data.value.username, form_data.value.password)
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
.contenuto_modulo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
}

:deep(.n-form) {
        min-width: 60%;
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 748px) {
    :deep(.n-form) {
        min-width: 95%;
    }
}

</style>

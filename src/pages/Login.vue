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
            <div class="contenuto_modulo">

                <!-- card naive che racchiude il form di login -->
                <n-card title="Accedi" class="scheda_login">

                    <!-- form naive collegato al modello form_data -->
                    <n-form :model="form_data" @submit.prevent="gestisciLogin" :rules="rules">

                        <!-- Campo Username -->
                        <n-form-item label="Username" path="username">
                            <n-input round v-model:value="form_data.username" placeholder="Username" />
                        </n-form-item>

                        <!-- Campo password -->
                        <n-form-item label="Password" path="password">
                            <n-input round v-model:value="form_data.password" type="password" placeholder="Password" />
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

async function gestisciLogin() {
    // se i campi sono vuoti non effettuo neanche la chiamata API
    if (!form_data.value.username || !form_data.value.password) return;

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
    display: flex;/* attiva il layout flex */
    flex-direction: column; /* dispone gli elementi in colonna */
    align-items: center; /* centra verticalmente */
    justify-content: center;/* centra orizzontalmente */
    min-height: 60vh; /* occupa almeno il 60% dell'altezza dello schermo */
}





</style>

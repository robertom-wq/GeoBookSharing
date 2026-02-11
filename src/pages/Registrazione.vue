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
                        <n-form-item label="Password" path="password">
                            <n-input v-model:value="form_value.password" type="password" placeholder="Password" />
                        </n-form-item>
                        <!-- Accettazione termini privacy -->
                        <n-form-item label="Privacy" path="privacy_policy_accettata">
                            <n-checkbox v-model:checked="form_value.privacy_policy_accettata"
                                >Accetta i <a @click="showPrivacyModal = true" class="link-privacy">termini sulla privacy</a></n-checkbox>
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
    <n-modal
        v-model:show="showPrivacyModal"
        preset="card"
        style="width: 600px; max-width: 90vw"
        title="Informativa sulla Privacy (GDPR)"
        class="mobile-pila"
        >
        <div class="testo-privacy">
            <h3>1. Tipologia di Dati Raccolti</h3>
            <p>I dati raccolti includono: Nome, Cognome, Email, Username e Immagine del profilo (Avatar).</p>
            
            <h3>2. Visibilità dei Dati</h3>
            <p><strong>Dati Privati:</strong> Nome, Cognome ed Email sono visibili solo a te e agli amministratori.</p>
            <p><strong>Dati Pubblici:</strong> Username e Immagine del profilo sono visibili agli altri utenti per facilitare gli scambi.</p>

            <h3>3. Cookie</h3>
            <p>Utilizziamo esclusivamente cookie tecnici di autenticazione necessari al funzionamento del portale.</p>

            <h3>4. Cancellazione</h3>
            <p>Puoi richiedere la cancellazione dal profilo. I dati verranno eliminati definitivamente dopo 10 giorni (periodo di ripensamento).</p>
        </div>
        <template #footer>
            <n-button type="primary" @click="showPrivacyModal = false">Ho capito</n-button>
        </template>
    </n-modal>
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
  password: '',
  privacy_policy_accettata: false
})
const showPrivacyModal = ref(false)
// Regole di validazione
const rules = {
  nome: { required: true, message: 'Nome obbligatorio', trigger: 'blur' },
  cognome: { required: true, message: 'Cognome obbligatorio', trigger: 'blur' },
  username: { required: true, message: 'Username obbligatorio', trigger: 'blur' },
  privacy_policy_accettata : [
{
    validator: (rule, value, callback) => {
      // Logga il valore per debuggare in console (aprila con F12)
      console.log("Valore privacy:", value); 
      
      if (value === true) {
        callback(); // Successo
      } else {
        callback(new Error('Accettare le Privacy Policy per completare la registrazione')); // Errore
      }
    },
    trigger: ['blur', 'change'] // Ascolta entrambi gli eventi
  }
  ],
  
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

.link-privacy {
    color: #3194E7; /* Il tuo --btn-primary-color */
    text-decoration: underline;
    margin-left: 4px;
    font-weight: 500;
}

.testo-privacy {
    line-height: 1.6;
    padding: 10px;
}

.testo-privacy h3 {
    margin-top: 15px;
    color: var(--color-text-dark);
}

</style>
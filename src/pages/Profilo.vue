<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- intestazione della pagina di profilo -->
            <div class="intestazione">

                <!-- Titolo principale -->
                <h1>{{ titoloPagina }}</h1>

                <!-- Sottotitolo personalizzato in base al ruolo di chi accede al profilo-->
                <p v-if="is_admin_modifica" class="sottotitolo">
                    Ciao <strong>{{ nome_loggato.toUpperCase() }}</strong>, stai modificando il profilo di
                    <span class="testo_evidenziato">{{ username_target }}</span>
                </p>
                <p v-else>
                    Ciao {{ nome_loggato.toUpperCase() }}, modifica il tuo profilo o accedi alle tue statistiche
                </p>
            </div>
            <!-- Contenitore del contenuto del profilo -->
            <div class="contenuto_modulo">

                <!--spin caricamento pagina che atetnde il caricamento dati dallo store-->
                <n-spin :show="utenti_store.loading">

                    <!-- Tabs per navigare tra profilo e dashboard -->
                    <n-tabs type="card" animated class="scheda_tab" default-value="profilo">
                        
                        <!-- TAB: Modifica Profilo -->
                        <n-tab-pane :tab="`Dati Profilo`" name="profilo">

                            <!-- Card che contiene il form di modifica profilo -->
                            <n-card v-if="form_data" class="profilo_card" title="Modifica Profilo" :bordered="true">
                                <!-- Form naive con validazione -->
                                <n-form :model="form_data" :rules="rules" ref="form_ref" label-width="120px"
                                    class="responsive-form">

                                    <!-- Sezione Avatar -->
                                    <n-form-item class="avatar" label="Avatar">
                                        <div class="avatar_container">
                                            <n-avatar :src="avatar_src" round size="large" class="avatar_img" />
                                            <!-- Upload immagine avatar -->
                                            <n-upload @before-upload="controlloPreUpload" :default-upload="false"
                                                accept="image/*" :max-count="1" v-model:file-list="lista_files"
                                                :show-file-list="false" @update:file-list="gestisciCaricamentoFile">
                                                <n-button round type="info" ghost size="small">Upload foto</n-button>
                                            </n-upload>
                                        </div>
                                    </n-form-item>
                                    <!-- Campo Nome -->
                                    <n-form-item label="Nome" path="nome">
                                        <n-input round v-model:value="form_data.nome" />
                                    </n-form-item>
                                    <!-- Campo Cognome -->
                                    <n-form-item label="Cognome" path="cognome">
                                        <n-input round v-model:value="form_data.cognome" />
                                    </n-form-item>
                                    <!-- Campo Username -->
                                    <n-form-item label="Username" path="username">
                                        <n-input round v-model:value="form_data.username" />
                                    </n-form-item>
                                    <!-- Campo Biografia -->
                                    <n-form-item label="Biografia" path="biografia">
                                        <n-input round v-model:value="form_data.biografia" type="textarea"
                                            :autosize="{ minRows: 3, maxRows: 6 }" />
                                    </n-form-item>
                                    <!-- Campo Email (non modificabile) -->
                                    <n-form-item label="Email" path="email">
                                        <n-input round v-model:value="form_data.email" type="email" :disabled="true" />
                                    </n-form-item>
                                    <!-- Campo nuova password -->
                                    <n-form-item label="Nuova password" path="password">
                                        <n-input round v-model:value="form_data.password" type="password"
                                            placeholder="Minimo 6 caratteri" autocomplete="new-password" />
                                    </n-form-item>
                                    <!-- Sezione visibile solo agli amministratori -->
                                    <template v-if="is_admin_modifica">
                                        <n-divider title-placement="left">Amministrazione</n-divider>
                                        <!-- Selezione ruolo utente -->
                                        <n-form-item label="Assegna ruolo" path="ruolo">
                                            <n-select round v-model:value="form_data.ruolo"
                                                :options="[{ label: 'Admin', value: 'admin' }, { label: 'Utente', value: 'user' }]" />
                                        </n-form-item>
                                        <!-- Stato richiesta eliminazione (sola lettura) -->
                                        <n-form-item label="Richiesta eliminazione" path="richiesta_eliminazione">
                                            <n-checkbox v-model:checked="form_data.richiesta_eliminazione"
                                                :disabled="true">Richiesta Eliminazione inviata</n-checkbox>
                                        </n-form-item>
                                        <!-- Blocco utente -->
                                        <n-form-item label="Blocca Utente" path="bannato">
                                            <n-checkbox v-model:checked="form_data.bannato">Blocca Utente</n-checkbox>
                                        </n-form-item>
                                    </template>
                                    <!-- Sezione visibile all'utente standard -->
                                    <div v-else>
                                        <p>Ruolo attuale: <span style="font-weight: bold;">{{ form_data.ruolo }}</span>
                                        </p>
                                        <n-form-item label="Richiesta eliminazione" path="richiesta_eliminazione">
                                            <n-checkbox v-model:checked="form_data.richiesta_eliminazione">{{
                                                testo_richiesta_eliminazione }}</n-checkbox>
                                        </n-form-item>
                                    </div>

                                    <n-divider />

                                    <div class="pulsanti_azione">
                                        <n-button type="primary" :loading="utenti_store.loading"
                                            @click="inviaDati">Salva Modifiche</n-button>
                                        <n-button v-if="is_admin_modifica && form_data.richiesta_eliminazione"
                                            type="warning" @click="mostra_modale_conferma = true">Elimina
                                            utente</n-button>
                                    </div>
                                </n-form>
                            </n-card>
                        </n-tab-pane>
                        <!-- TAB: Dashboard utente, visibile solo all'utente -->
                        <n-tab-pane v-if="!is_admin_modifica" :tab="`Le tue Statistiche`" name="dashboard">
                            <!--Dashboard utente, da implementare-->
                        </n-tab-pane>

                    </n-tabs>
                </n-spin>
            </div>
        </section>
        <!-- Modale di conferma eliminazione utente -->
        <ModaleConferma v-model:show="mostra_modale_conferma" titolo="Elimina Utente"
            :messaggio="'Sei sicuro di voler eliminare l\'utente \'\'' + form_data?.username + '\'\'? Questa operazione è irreversibile.'"
            testoConferma="Elimina Definitivamente" tipo="warning" @conferma="gestisciDeleteUtente()" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUtentiStore } from '@/stores/utentiStore'

// Componenti
import ModaleConferma from '@/components/ModaleConferma.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const utenti_store = useUtentiStore()

const image_url = import.meta.env.VITE_ROOT_URL // url base per le immagini da file .env

// Stati
const form_ref = ref(null) // riferimento al componente form per la validazione
const mostra_modale_conferma = ref(false) // stato visibilita modale eliminazione
const form_data = ref(null) // Dati locali per il form
const utente = ref(null)
// Gestione Files
const lista_files = ref([]) // array contente la lista di files caricati (componente upload)
const file = ref(null) // file da inviare
const anteprima = ref(null) // url temporaneo per visualizzazione immediata


//Logica di navigazione
const utente_da_modificare_id = computed(() => route.params.id ? parseInt(route.params.id) : null) // recupera id da url se presente
const is_admin_modifica = computed(() => !!utente_da_modificare_id.value) // true se admin sta modificando altri
const nome_loggato = computed(() => form_data.value?.nome || 'Ospite') // nome per messaggio benvenuto, reattivo al cambiamento sul form
const username_target = computed(() => form_data.value?.username || '...') // username utente target
const titoloPagina = computed(() => is_admin_modifica.value ? 'Gestione Utente' : 'Il Mio Profilo') // titolo dinamico


const testo_richiesta_eliminazione = computed(() => form_data.value?.richiesta_eliminazione ? 'Richiesta in corso' : 'Invia Richiesta')// testo dinamico checkbox richiesta eliminazione

// validazione form
const rules = {
    nome: { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
    cognome: { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
    username: { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
}

//computed dedicato alla scelta di cosa visualizzare nel riquadro dell'avatar
const avatar_src = computed(() => {
    // mostra anteprima locale se utente ha appena caricato foto
    if (anteprima.value) {
        return anteprima.value
    }
    // altrimenti mostra avatar dal server se esiste
    return form_data.value?.avatar
        ? `${image_url}/${form_data.value.avatar}`
        : '/placeholder_utente.png'
})


//inizializzaazione pagina
async function inizializzaPagina() {
    pulisciStatoFile() //resetta variabili upload
    await caricaDatiUtente()//carica info utente
}

//caricamento dati dell'utente
async function caricaDatiUtente() {
    utente.value = null
    // logica per admin che modifica altro utente
    if (is_admin_modifica.value) {
        const res = await utenti_store.getUtenteByID(utente_da_modificare_id.value)
        utente.value = res.utente
    } else {
        // logica per utente che modifica il profilo personale
        if (!utenti_store.utente) {
            await utenti_store.getUtente()
        }
        utente.value = utenti_store.utente
    }

    if (utente.value) {
        // compilazione form_data locale clonando l'oggetto
        //console.log("dati utente caricati", utente.value)
        form_data.value = {
            ...utente.value,
            password: '', // reset password per sicurezza
            bannato: !!utente.value.bannato // forza conversione in booleano
        }
    }
    //console.log("Immagine", form_data.value.avatar)

}

//gestione pre upload dei files
function controlloPreUpload({ file }) {
    //console.log("File", file)
    const dimensione_massima = 5 * 1024 * 1024 // 5 MB dimensione massima
    const file_nativo = file.file

    // controllo tipo mime (solo immagini)
    if (!file_nativo.type.startsWith('image/')) {
        message.error('Devi caricare un\'immagine valida!')
        return false
    }

    //Controllo della dimensione
    if (file_nativo.size > dimensione_massima) {
        message.error('L’immagine non deve superare i 5 MB')
        return false
    }

    return true // Solo se valido
}

//gestione caricamento effettivo dell'immagine
function gestisciCaricamentoFile(upload) {
    // mantengo solo l'ultimo file caricato, qualora fossero stati caricati per errore piu files
    if (upload.length > 1) {
        upload = [upload[upload.length - 1]]
    }
    lista_files.value = upload
    const f = lista_files.value[0]?.file
    // se nessun file caricato, pulisci tutto
    if (!f) {
        file.value = null
        anteprima.value = null
        return
    }
    file.value = f
    anteprima.value = URL.createObjectURL(f) // crea url blob per anteprima
}

function pulisciStatoFile() {
    file.value = null
    if (anteprima.value) {
        // revoca url blob per evitare memory leak
        URL.revokeObjectURL(anteprima.value)
        anteprima.value = null
    }
    lista_files.value = []
}

//Gestione invio dati del form
async function inviaDati() {
    try {
        await form_ref.value?.validate() // validazione regole form

        const fd = new FormData() // FormData necessario per invio files

        // append dei vari dati
        fd.append('nome', form_data.value.nome || '')
        fd.append('cognome', form_data.value.cognome || '')
        fd.append('username', form_data.value.username || '')
        fd.append('biografia', form_data.value.biografia || '')

        // invia password solo se compilata
        if (form_data.value.password) {
            fd.append('hashed_password', form_data.value.password)
        }

        // campi riservati gestione admin
        if (is_admin_modifica.value) {
            fd.append('ruolo', form_data.value.ruolo)
            fd.append('bannato', String(form_data.value.bannato)) // conversione stringa
        }

        // allego file se presente
        if (file.value) {
            fd.append('type', 'avatar')
            fd.append('file', file.value)
        }

        const id_target = is_admin_modifica.value ? utente_da_modificare_id.value : null

        // chiamata api aggiornamento profilo tramite store
        const risposta_update = await utenti_store.updateUtente(id_target, fd, is_admin_modifica.value)

        // gestione separata richiesta eliminazione, soft delete
        if (!is_admin_modifica.value && form_data.value.richiesta_eliminazione !== undefined) {
            await utenti_store.softDeleteUtente(form_data.value.richiesta_eliminazione)
        }

        //console.log("risposta_update?.utente.avatar", risposta_update.data)
        // aggiorna dati locali con risposta dal backend
        if (risposta_update?.data) {
            form_data.value = { ...form_data.value, ...risposta_update.data }
        }

        message.success('Profilo aggiornato!')


    } catch (err) {
        message.error(err.message || "Errore durante il salvataggio")
    } finally {
        pulisciStatoFile() // resetta input file dopo invio

    }
}

// funzione solo per admin: eliminazione fisica
async function gestisciDeleteUtente() {
    if (is_admin_modifica.value) {
        try {
            await utenti_store.deleteUtente(utente_da_modificare_id.value)
            router.push({ name: 'Home' }) // redirect dopo eliminazione (MODIFICARE la destinazione una volta creata pagina dedicata agli admin)
            message.success(`Profilo eliminato`)
        } catch (err) {
            console.error(err.message)
            message.error(err.message || 'Errore eliminazione')
        }
    }
}

// watchers
// ricarica i dati se cambia id nell'url (in caso di navigazione tra profili da parte degli admin)
watch(() => route.fullPath, () => {
    inizializzaPagina()
})

onMounted(() => {
    inizializzaPagina()
})

onBeforeUnmount(() => {
    if (anteprima.value) {
        URL.revokeObjectURL(anteprima.value)
    }
})
</script>

<style scoped>    
/* Unione degli stili di Profilo.vue e UtenteScheda.vue */
.profilo_card {
    max-width: clamp(18.75rem, 90vw, 38rem);/* Larghezza fluida: non supera i 500px ma occupa il 95% su schermi piccoli */
    margin: 3rem auto;  /* Centratura orizzontalmente e distanzia verticalmente con margini in rem */
    padding: clamp(0.5rem, 3vw, 2rem);
    /* Utilizzo variabili globali */
    background-color: var(--pearl-white-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

.n-button {
    min-width: 7rem; /* assicura che il bottone non sia troppo stretto */
}

/*centratura titolo della card */
:deep(.n-card > .n-card-header) {
    text-align: center; 
}

.avatar_container {
    text-align: center; /* centra gli elementi interni (img e bottone) */
    width: 100%; /* occupa tutta la larghezza disponibile */
}

.avatar_img {
    width: 9.375rem; /* larghezza fissa dell'immagine */
    height: 9.375rem; /* altezza fissa dell'immagine */
    margin-bottom: 0.625rem; /* spazio sotto l'immagine prima del bottone */
}

.testo_evidenziato {
    color: #7fb9db;
    font-weight: bold;
}

.scheda_tab {
    margin-top: 2rem; /* spazio sopra le tab per separarle dall'intestazione */
}

/* centra il contenuto del form item avatar */
:deep(.n-form-item.avatar .n-form-item-blank) {
    flex-direction: column; /* immagine e bottone in colonna */
    justify-content: center; /* centra verticalmente, asse principale è verticale */
    gap: 1rem;
}

.pulsanti_azione {
    width: 100%; /* occupa tutta la larghezza disponibile */
    display: flex; /* attivo flexbox per gestire i bottoni interni */
    justify-content: center; /*Pulsanti al centro*/
    gap: 0.85rem; /* spazio tra un bottone e l'altro (potrebbero essercene 2 in caso eliminazione utente) */
}


/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .profilo_card {
        width: 100% !important;
        margin: 1rem auto;  /* Centratura con margini in rem */
    }

    /* input più grandi per il touch */
    :deep(.n-input) {
        min-height: 2.5rem;/* rende la casella di testo piu alta per il touch */
        font-size: small;/* riduce leggermente la dimensione del font */
    }

    .pulsanti_azione {
        flex-direction: column;/* bottoni uno sopra l'altro su mobile */
        align-items: stretch; /* allarga i bottoni a tutta la larghezza */
        gap: 1rem; /* aumenta lo spazio tra i bottoni */
        padding-bottom: 2rem; /* spazio in fondo alla pagina */ 
    }

    :deep(.n-card__content) {
        padding: 0; /* azzero il padding della card in modo da predere piu spazio laterale possibile */
    }

    .n-button {
        font-size: 1.2rem; /* dimensione testo e altezza bottone aumentati per migliorare esperienza con touch */
        height: 2.3rem;
    }    
}
</style>
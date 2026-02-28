<template>
    <div class="page">
        <section>
            <div class="intestazione">
                <h1>{{ titolo_pagina }}</h1>
                <!--doppia casistica per la modifica, admin o utente loggato-->
                <p v-if="is_admin_modifica" class="sottotitolo">
                    Ciao <strong>{{ utenti_store.utente.nome.toUpperCase() }}</strong>, stai modificando il profilo di
                    <span class="testo_evidenziato">{{ username_target }}</span>
                </p>
                <p v-else>
                    Ciao {{utenti_store.utente?.nome.toUpperCase() }}, modifica il tuo profilo o accedi alle tue statistiche
                </p>
            </div>
            <div class="contenuto_modulo">
                <n-spin :show="utenti_store.loading">
                    <!-- Tabs per navigare tra profilo e dashboard -->
                    <n-tabs type="card" animated class="scheda_tab" default-value="profilo">
                        
                        <!-- TAB: Modifica Profilo -->
                        <n-tab-pane :tab="`Dati Profilo`" name="profilo">
                            <div id="contenuto_modulo">
                            <n-card v-if="form_data" class="profilo_card" title="Modifica Profilo" :bordered="true">
                                <n-form :model="form_data" :rules="rules" ref="form_ref" label-width="120px"
                                    class="responsive-form">
                                    <n-form-item class="sezione_copertina_avatar" label="Avatar">
                                        <div class="avatar_copertina_container">
                                            <n-avatar :src="avatar_src" round size="large" class="avatar_copertina_img" />
                                            <!--:default-upload="false" perché non voglio che il file venga inviato al back-end appena selezionato
                                             ma solo quando l'utente invia il form-->
                                            <n-upload @before-upload="controlloPreUpload" :default-upload="false"
                                                accept="image/*" :max-count="1" v-model:file-list="lista_files"
                                                :show-file-list="false" @update:file-list="gestisciCaricamentoFile">
                                                <n-button round type="info" ghost size="small">Upload foto</n-button>
                                            </n-upload>
                                        </div>
                                    </n-form-item>
                                    <n-form-item label="Nome" path="nome">
                                        <n-input round v-model:value="form_data.nome" />
                                    </n-form-item>
                                    <n-form-item label="Cognome" path="cognome">
                                        <n-input round v-model:value="form_data.cognome" />
                                    </n-form-item>
                                    <n-form-item label="Username" path="username">
                                        <n-input round v-model:value="form_data.username" />
                                    </n-form-item>
                                    <n-form-item label="Biografia" path="biografia">
                                        <n-input round v-model:value="form_data.biografia" type="textarea"
                                            :autosize="{ minRows: 3, maxRows: 6 }" />
                                    </n-form-item>
                                    <n-form-item label="Email" path="email">
                                        <n-input round v-model:value="form_data.email" type="email" :disabled="true" />
                                    </n-form-item>
                                    <n-form-item label="Nuova password" path="password">
                                        <n-input round v-model:value="form_data.password" type="password"
                                            placeholder="Minimo 6 caratteri" autocomplete="new-password" />
                                    </n-form-item>
                                    <!-- Sezione visibile solo agli amministratori -->
                                    <template v-if="is_admin_modifica">
                                        <n-divider title-placement="left">Amministrazione</n-divider>
                                        <n-form-item label="Assegna ruolo" path="ruolo">
                                            <n-select round v-model:value="form_data.ruolo"
                                                :options="[{ label: 'Admin', value: 'admin' }, { label: 'Utente', value: 'user' }]" />
                                        </n-form-item>
                                        <n-form-item label="Richiesta eliminazione" path="richiesta_eliminazione">
                                            <n-checkbox v-model:checked="form_data.richiesta_eliminazione"
                                                :disabled="true">Richiesta Eliminazione inviata</n-checkbox>
                                        </n-form-item>
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

                                    <!--n-divider /-->

                                </n-form>
                            </n-card>
                            </div>
                            <div class="pulsanti_azione">
                                <n-button type="primary" :loading="utenti_store.loading"
                                    @click="inviaDati">Salva Modifiche</n-button>
                                <n-button v-if="is_admin_modifica && form_data?.richiesta_eliminazione"
                                    type="warning" @click="mostra_modale_conferma = true">Elimina
                                    utente</n-button>
                            </div>
                        </n-tab-pane>
                        <!-- TAB: Dashboard utente, visibile solo all'utente -->
                        <n-tab-pane v-if="!is_admin_modifica" :tab="`Le tue Statistiche`" name="dashboard">
                            <DashboardUtente 
                                :dati_report="dati_report"/>
                        </n-tab-pane>

                    </n-tabs>
                </n-spin>
            </div>
        </section>
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
import { useLibriStore } from '@/stores/libriStore'
import { useCondivisioniStore } from '@/stores/condivisioniStore'
import { useValutazioniStore } from '@/stores/valutazioniStore'
import DashboardUtente from '@/components/DashboardUtente.vue'
import ModaleConferma from '@/components/ModaleConferma.vue'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const utenti_store = useUtentiStore()
const libri_store = useLibriStore()
const valutazioni_store = useValutazioniStore()
const condivisioni_store = useCondivisioniStore()

const image_url = import.meta.env.VITE_ROOT_URL // url base per le immagini da file .env

// Stati
const form_ref = ref(null) // riferimento al componente form per la validazione
const mostra_modale_conferma = ref(false) 
const form_data = ref(null) // Dati locali per il form
const utente = ref(null)
const dati_report = ref({ 
    media_voto: 0,
    libri_condivisi: 0,
    libri_richiesti:0,
    libri_ricercati: [],
    recensioni: []
})
// Gestione Files
const lista_files = ref([]) // array contente la lista di files caricati (componente upload)
const file = ref(null) // file da inviare
const anteprima = ref(null) // url temporaneo per visualizzazione immediata


const utente_da_modificare_id = computed(() => route.params.id ? parseInt(route.params.id) : null) // recupera id da url se presente
const is_admin_modifica = computed(() => !!utente_da_modificare_id.value && utenti_store.utente.ruolo === 'admin') // true se admin sta modificando altri
const username_target = computed(() => form_data.value?.username || '...') // username utente target
const titolo_pagina = computed(() => is_admin_modifica.value ? 'Gestione Utente' : 'Il Mio Profilo') // titolo dinamico

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


async function inizializzaPagina() {
    pulisciStatoFile() //resetta variabili upload
    await caricaDatiUtente()
    try {
        // Eseguo in parallelo il recupero dati libri, condivisioni e valutazioni utente
        if (utente.value) {
            await Promise.all([
                getStatisticheLibriUtente(),
                getStatisticheCondivisioniUtente(),
                getStatisticheValutazioniUtente()
            ])
            //console.log("VALORI", dati_report.value)
        }
    } catch (err) {
        message.error("Errore inizializzazione Dati")
        console.error("Errore inizializzazione:", err)
    }     
}

async function caricaDatiUtente() {
    utente.value = null
    // logica per admin che modifica altro utente
    if (is_admin_modifica.value) {
        const utente_by_id = await utenti_store.getUtenteByID(utente_da_modificare_id.value)
        utente.value = utenti_store.utente_selezionato
    } else {
        // logica per utente che modifica il profilo personale
        if (!utenti_store.utente) {
            await utenti_store.getUtente()
        }
        utente.value = utenti_store.utente
    }

    if (utente.value) {
        // compilazione form_data locale clonando l'oggetto utente
        form_data.value = {
            ...utente.value,
            password: '', // reset password per sicurezza
            bannato: !!utente.value.bannato // forza conversione in booleano
        }
    }
    //console.log("Immagine", form_data.value.avatar)

}

async function getStatisticheLibriUtente() {
    await libri_store.getMieiLibri()
    const libri = libri_store.miei_libri
    if (libri && libri.length > 0) {
      //[...] per non mutare l'array originale
      const ordinati = [...libri].sort((a, b) => b.visualizzazioni - a.visualizzazioni)
      const piu_visualizzato = ordinati[0]
      const meno_visualizzato = ordinati[ordinati.length - 1]
      dati_report.value.libri_ricercati = [piu_visualizzato, meno_visualizzato]
    }
}

  async function getStatisticheCondivisioniUtente() {
    await condivisioni_store.getMieCondivisioni()
    const condivisioni_p = condivisioni_store.mie_condivisioni_proprietario
    if (condivisioni_p && condivisioni_p.length > 0) {
        dati_report.value.libri_condivisi = condivisioni_p.length
    }
    const condivisioni_r = condivisioni_store.mie_condivisioni_richiedente
    if (condivisioni_r && condivisioni_r.length > 0) {
        dati_report.value.libri_richiesti = condivisioni_r.length
  }
}

  async function getStatisticheValutazioniUtente() {
    await Promise.all([
        valutazioni_store.getMieValutazioni(),
        valutazioni_store.getRankingUtenteByID(utente.value.id)
        ])
    const voto = valutazioni_store.ranking_utente_selezionato
    const ultime_valutazioni = [...valutazioni_store.mie_valutazioni_ricevute].sort((a, b) => new Date(b.data_creazione) - new Date(a.data_creazione)).slice(0, 5)
    dati_report.value.media_voto = parseFloat(voto.media_voto)
    dati_report.value.recensioni = ultime_valutazioni
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

    //controllo della dimensione
    if (file_nativo.size > dimensione_massima) {
        message.error('L’immagine non deve superare i 5 MB')
        return false
    }

    return true 
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
        pulisciStatoFile()
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

        //aggiornamento profilo tramite store
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
        
        // se admin ha modificato il profilo di utente, viene riportato nella AdminPage
        if(is_admin_modifica.value) {
            router.push({name: 'AdminPage'})
        }


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

.testo_evidenziato {
    color: #7fb9db;
    font-weight: bold;
}

.scheda_tab {
    margin-top: 2rem; /* spazio sopra le tab per separarle dall'intestazione */
}
#contenuto_modulo {
    background-image: linear-gradient(to top, rgb(255 255 255), #ffffff24 30%), linear-gradient(to bottom, rgb(255 255 255), #ffffff94 30%), url(/sfondo_hero.webp);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}


@media (max-width: 768px) {
  .modale_conferma_eliminazione {
      display: flex!important;
      justify-content: flex-end!important;
  }
  #contenuto_modulo {
    background-image: none;
}
}

</style>
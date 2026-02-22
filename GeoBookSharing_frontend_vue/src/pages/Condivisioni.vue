<template>
    <div class="page">
        <div class="intestazione">
            <h1>Condivisioni</h1>
            <p class="sottotitolo">Gestisci le tue condivisioni</p>
        </div>
        <div class="contenuto_principale">
            <n-spin :show="condivisioni_store.loading">
                <n-tabs type="card" animated class="contenitore_tab" default-value="in_attesa">
                    <n-tab-pane name="in_attesa" tab="Richieste in Attesa">
                        <n-alert v-if="richieste_in_attesa?.length === 0" title="Nessuna Richiesta" type="info" :show-icon="false" class="avviso_lista_vuota">
                            Non ci sono azioni richieste per le condivisioni concesse.
                        </n-alert>
                        <n-list hoverable v-else class="lista_richieste">
                            <n-list-item v-for="richiesta in richieste_in_attesa" :key="richiesta.id" class="item_ricevuto" >
                                <n-thing>
                                    <template #header>
                                        <div class="header_prioritario">
                                            <n-tag type="success" size="small" strong round class="tag_tipo_richiesta">Richiesta Ricevuta</n-tag>
                                            <n-tag type="warning" size="small" round>In attesa</n-tag>
                                            <div class="header_richiesta">
                                                <n-avatar round size="small" :src="`${image_url}/${richiesta.richiedente.avatar}`" />
                                                <span @click="apriDettaglioUtente(richiesta.richiedente_id)" class="nome_utente_enfasi">{{ richiesta.richiedente.username }}</span>
                                                <div class="badge_voti">
                                                    <n-icon size="14" color="#fbb337">
                                                        <Star />
                                                    </n-icon>
                                                    <span class="testo_voto">{{ valutazioni_store.ranking_utenti[richiesta.richiedente.id]?.media_voto || '0' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    
                                    <template #description>
                                        <div class="info_libro_richiesto">
                                            <span class="label_grigia_bio">Libro richiesto: </span>
                                            <span class="titolo_libro_info">{{ richiesta.libro.titolo }}</span>
                                        </div>
                                    </template>
                                    <div class="periodo_condivisione">
                                        <n-icon size="16"><CalendarOutline /></n-icon>
                                        <span>Dal <strong>{{ formattaData(richiesta.data_dal) }}</strong> al <strong>{{ formattaData(richiesta.data_al) }}</strong></span>
                                    </div>
                                    <div class="testo_note">
                                        <span><strong>Note:</strong></span>
                                        <br>
                                        {{ richiesta.note || "Nessuna nota"}}
                                    </div>
                                    <template #action>
                                        <div class="area_azioni_condivisione">
                                            <n-button type="primary" ghost size="small" @click="gestisciAccetta(richiesta.id)">Accetta</n-button>
                                            <n-button type="warning" size="small" @click="preparaRifiuto(richiesta.id)">Rifiuta</n-button>
                                        </div>
                                    </template>
                                </n-thing>
                            </n-list-item>
                        </n-list>
                    </n-tab-pane>
                    <n-tab-pane name="storico" tab="Storico">
                        <n-list hoverable bordered v-if="storico_condivisioni?.length > 0" class="lista_storico">
                            <n-list-item v-for="elemento in storico_condivisioni" :key="elemento.id" :class="elemento.is_inviata ? 'item_inviato' : 'item_ricevuto'">
                                <n-thing>
                                    <template #header>
                                        <div class="header_prioritario">
                                            <n-tag :type="elemento.is_inviata ? 'info' : 'success'" size="small" strong round class="tag_tipo_richiesta">
                                                {{ elemento.is_inviata ? 'Richiesta Inviata' : 'Richiesta Ricevuta' }}
                                            </n-tag>
                                            <n-tag :type="getStatoCondivisione(elemento).type" size="small" ghost>{{ getStatoCondivisione(elemento).text }}</n-tag>
                                            <div class="header_richiesta">
                                                <n-avatar round size="small" :src="elemento.is_inviata ? `${image_url}/${elemento.proprietario.avatar}` : `${image_url}/${elemento.richiedente.avatar}`" />
                                                <span @click="apriDettaglioUtente(elemento.richiedente_id)" class="nome_utente_enfasi">{{ elemento.is_inviata ? elemento.proprietario.username : elemento.richiedente.username }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <template #description>
                                        <div class="info_libro_richiesto">
                                            <span class="label_grigia_bio">Libro: </span>
                                            <span class="titolo_libro_info">"{{ elemento.libro.titolo }}"</span>
                                        </div>
                                    </template>
                                    <div class="periodo_condivisione">
                                        <n-icon size="16"><CalendarOutline /></n-icon>
                                        <span>Dal <strong>{{ formattaData(elemento.data_dal) }}</strong> al <strong>{{ formattaData(elemento.data_al) }}</strong></span>
                                    </div>
                                    <div class="testo_note">
                                        <span><strong>Note:</strong></span>
                                        <br>
                                        {{ elemento.note || "Nessuna nota" }}
                                    </div>
                                    <!-- azioni storico (conclusione prestito a seguito di restituzione, annullamento di una richiesta ancora in pending, eliminazione
                                     elemento da storico e recensione della condivisione) -->
                                    <template #action>
                                        <div class="area_azioni_condivisione">
                                            <n-button v-if="elemento.is_confermato && !elemento.is_completato && !elemento.is_inviata" type="primary" size="small" @click="gestisciCompletamentoCondivisione(elemento.id)">Concludi</n-button>
                                            <n-button v-if="elemento.is_completato && !elemento.is_recensita" type="warning" size="small" ghost @click="preparaRecensione(elemento)">Lascia Recensione</n-button>
                                            <n-button v-if="(elemento.is_inviata && !elemento.is_confermato ) || elemento.is_completato" type="primary" ghost size="small" @click="gestisciDeleteCondivisione(elemento.is_inviata, elemento.is_completato, elemento.id )">
                                                {{ elemento.is_completato ? 'Elimina' : 'Annulla' }}
                                            </n-button>
                                        </div>
                                    </template>
                                </n-thing>
                            </n-list-item>
                        </n-list>
                        <n-alert v-else type="info" class="avviso_margine_alto">Nessuno storico presente.</n-alert>
                    </n-tab-pane>
                </n-tabs>
            </n-spin>
        </div>
        <ModaleConferma v-model:show="mostra_modale_conferma" 
            titolo="Conferma" :messaggio="`Sei sicuro di voler ${testo_azione}?`"
            @conferma="confermaDeleteCondivisione(id_elemento_da_eliminare)" />

        <n-modal v-model:show="mostra_modale_recensione" preset="dialog" title="Recensione" class="modale_feedback">
            <n-form-item label="Voto">
                <div class="stelle_centrate"><n-rate v-model:value="form_recensione.voto" :size="42" /></div>
            </n-form-item>
            <n-input v-model:value="form_recensione.recensione" type="textarea" placeholder="Commento..." />
            <template #action>
                <n-button type="primary" @click="invioDati">Invia</n-button>
            </template>
        </n-modal>

        <n-modal v-model:show="mostra_modale_rifiuto" preset="dialog" title="Motivo Rifiuto" class="modale_feedback">
            <n-input v-model:value="form_rifiuto.note" type="textarea" placeholder="Perché rifiuti?" />
            <template #action>
                <n-button type="error" @click="gestisciRifiuto">Conferma Rifiuto</n-button>
            </template>
        </n-modal>

        <n-modal v-model:show="mostra_modale_dettaglio" preset="card" title="Profilo Utente" class="modale_profilo" style="width: 400px;">
            <div class="dettaglio_utente_container" v-if="utente_selezionato">
                <div class="testata_profilo">
                    <n-avatar round :size="80" :src="`${image_url}/${utente_selezionato.avatar}`" fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                    <h3 class="nome_utente_profilo">{{ utente_selezionato.username }}</h3>
                </div>
                
                <n-divider />

                <div class="sezione_bio">
                    <p class="label_grigia_bio">Biografia</p>
                    <p class="testo_bio">
                        {{ utente_selezionato.biografia || 'Nessuna biografia inserita.' }}
                    </p>
                </div>
            </div>
        </n-modal>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMessage, NTag, NButton, NModal, NAvatar } from 'naive-ui'
import { useCondivisioniStore } from '@/stores/condivisioniStore.js'
import { useValutazioniStore } from '@/stores/valutazioniStore.js'
import { useUtentiStore } from '@/stores/UtentiStore.js'
import { Star, CalendarOutline } from '@vicons/ionicons5'
import ModaleConferma from '@/components/ModaleConferma.vue'

const image_url = import.meta.env.VITE_ROOT_URL // url base per le immagini da file .env


const condivisioni_store = useCondivisioniStore()
const valutazioni_store = useValutazioniStore()
const utenti_store = useUtentiStore()
const message = useMessage()

//stati
const testo_azione = ref('')
const mostra_modale_conferma = ref(false)
const mostra_modale_recensione = ref(false)
const mostra_modale_rifiuto = ref(false)
const id_elemento_da_eliminare = ref(null)
const form_rifiuto = ref({
    id:null,
    note: ''
})
const mostra_modale_dettaglio = ref(false)
const utente_selezionato = ref(null)

const form_recensione = ref({
    condivisione_id: null,
    recensito_id: null,
    voto: null,
    recensione: ''
})

// filtro richieste ricevute in attesa di gestione
const richieste_in_attesa = computed(() => {
    // solo le condivisioni che non sono state ne completate ne confermate
    return condivisioni_store.mie_condivisioni_proprietario.filter(condivisione =>
        !condivisione.is_completato && !condivisione.is_confermato
    )
})

// identifico id delle condivisioni gia recensite dall'utente
const id_condivisioni_recensite = computed(() => {
    //se non è stato caricato lo store, Set vuoto per evitare errori
    if (!valutazioni_store.mie_valutazioni_all) {
        return new Set()
    }

    const inviate_da_me = valutazioni_store.mie_valutazioni_all.filter(valutazioni =>
        valutazioni.recensore_id === utenti_store.utente.id
    )
    //estraggo solo il campo condivisione_id
    return new Set(inviate_da_me.map(valutazioni =>
        valutazioni.condivisione_id)
    )
})

// unione e ordinamento di richieste inviate e ricevute
const storico_condivisioni = computed(() => {
    //richieste inviate
    const c_richieste = condivisioni_store.mie_condivisioni_richiedente.map(condivisione => ({
        ...condivisione,
        is_inviata: true,
        commento: `Richiesta inoltrata a ${condivisione.proprietario.username} per il libro ${condivisione.libro.titolo}`,
        is_recensita: id_condivisioni_recensite.value.has(condivisione.id)

    }))
    //richieste ricevute
    const c_concesse = condivisioni_store.mie_condivisioni_proprietario.map(condivisione => ({
        ...condivisione,
        is_inviata: false,
        commento: `Richiesta ricevuta da ${condivisione.richiedente.username} per il libro ${condivisione.libro.titolo}`,
        is_recensita: id_condivisioni_recensite.value.has(condivisione.id)
    })
    )
    const storico = [
        ...c_richieste,
        ...c_concesse
    ]
    //b - a, ordine cronologico dall'elemento piu recente al piu vecchio
    return storico.sort((a, b) => new Date(b.data_creazione) - new Date(a.data_creazione))
})

// formattazione stringa data in dd-mm-yyyy
const formattaData = (data) => {
    const d = new Date(data)
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

// mappatura stato in etichette e stili ui
function getStatoCondivisione(condivisione) {
    if (condivisione.is_completato) return { text: 'Completato', type: 'success' }
    if (condivisione.is_rifiutato) return { text: 'Rifiutato', type: 'error' }
    if (condivisione.is_annullato) return { text: 'Annullato', type: 'warning' }
    if (condivisione.is_confermato) return { text: 'Accettato (Attivo)', type: 'info' }
    
    if (condivisione.is_inviata) return { text: 'In Attesa Risposta', type: 'default' }

    return { text: 'In Attesa Gestione', type: 'default' }
}

// chiusura del prestito attivo (all'atto della restituzione)
async function gestisciCompletamentoCondivisione(id) {
    try {
        await condivisioni_store.concludiPrestito(id)
        message.success("Prestito concluso con successo")

    } catch (err) {
        message.error(err.message || 'Impossibile concludere il prestito')
        console.error("Impossibile concludere il prestito", err)  
    }
}

// inizializzazione procedura eliminazione o annullamento
async function gestisciDeleteCondivisione(is_inviata, is_completato, id_elemento) {
    //imposto la frase da inserire nella richiesta di conferma in base allo stao della richiesta
    testo_azione.value = (is_inviata && !is_completato) ? 'annullare la tua richiesta inviata' : 'eliminare questa voce dallo storico'
    id_elemento_da_eliminare.value = id_elemento
    mostra_modale_conferma.value = true
}

// funzione per aprire la modale caricando i dati dell'utente
async function apriDettaglioUtente(utente_id) {
    try {
        const utente = await utenti_store.getUtenteByID(utente_id)
        utente_selezionato.value = utente.utente
        mostra_modale_dettaglio.value = true
    } catch (err) {
        console.error("Impossibile recuperare dettagli", err)
        message.error(err.message || "Impossibile recuperare dettagli")
    }    
}

// rimozione condivisione tramite store
async function confermaDeleteCondivisione(id) {
    try {
        await condivisioni_store.deleteCondivisione(id, "Nessun Motivo")
        message.success("Richiesta Eliminata con successo")
    } catch (err) {
        console.error("Impossibile eliminare la richiesta", err)
        message.error(err.message)
    }
    
}

// configurazione dati per il modale di valutazione
function preparaRecensione(elemento) {
    // identificazione recensore e recensito
    const sono_proprietario = utenti_store.utente.id === elemento.proprietario_id
    const id_utente_da_recensire = sono_proprietario ? elemento.richiedente_id : elemento.proprietario_id

    form_recensione.value = {
        condivisione_id: elemento.id,
        recensito_id: id_utente_da_recensire,
        voto: 5,
        recensione: ''
    }
    mostra_modale_recensione.value = true
}

// validazione e invio dati recensione
async function invioDati() {
    if(!form_recensione.value.voto || form_recensione.value.voto < 1 || form_recensione.value.voto > 5) {
        message.error('Il voto deve essere compreso tra 1 e 5')
        return
    }
    try {
        const recensione = await valutazioni_store.creaValutazioneUtente(form_recensione.value)
        message.success("Recensione inviata con successo.")
        // forzo aggiornamento del ranking utente censito
        if (form_recensione.value.recensito_id) {
            await valutazioni_store.getRankingUtenteByID(form_recensione.value.recensito_id)
        }        
        
    } catch (err) {
        //console.log("Impossibile inviare la recensione",err)
        message.error(err.message || 'Impossibile inviare la recensione')
    } finally {
        mostra_modale_recensione.value = false
    }
}

// configurazione modale rifiuto richiesta
function preparaRifiuto(id){
    form_rifiuto.value.id = id
    form_rifiuto.value.note = ''
    mostra_modale_rifiuto.value = true
}

// gestione rifiuto con motivazione obbligatoria
async function gestisciRifiuto() {
    if (!form_rifiuto.value.id || !form_rifiuto.value.note){
        //se manca anche solo un campo obbligatorio
        return
    }
    try {
        const data = {id: form_rifiuto.value.id, azione:'rifiuta', note: form_rifiuto.value.note }
        await condivisioni_store.aggiornaStatoCondivisione(data)
        message.success("Richiesta rifiutata e notificata con successo")
    } catch (err) {
        message.error(err.message || "Impossibile rifiutare la richiesta")
        console.error("Impossibile rifiutare la richiesta", err)
        // pulizia form in caso di errore
        form_rifiuto.value.id = null
        form_rifiuto.value.note = ''
    }finally {
        mostra_modale_rifiuto.value = false
    }
}

// accettazione richiesta di condivisione
async function gestisciAccetta(id) {
    try {
        const data = {id: id, azione : 'accetta'}
        await condivisioni_store.aggiornaStatoCondivisione(data)
        message.success("Richiesta accettata con successo")
    } catch (err) {
        message.error(err.message || 'Impossibile accettare la richiesta')
        console.error('Impossibile accettare la richiesta', err)
    }
}

// monitoraggio richieste in attesa per aggiornamento ranking
watch(() => richieste_in_attesa.value, (nuova_lista) => {
    if (nuova_lista?.length) {
        nuova_lista.forEach(richiesta => valutazioni_store.getRankingUtenti(richiesta.richiedente.id))
    }
}, { immediate: true })


onMounted(async () => {
    await Promise.all([
        condivisioni_store.getMieCondivisioni(),
        valutazioni_store.getMieValutazioni()
    ])
    //console.log(condivisioni_store.mie_condivisioni_richiedente)
    //console.log(condivisioni_store.mie_condivisioni_proprietario)
    //console.log(richieste_in_attesa.value)
})

</script>


<style scoped>

/* layout flex per allineare tag, avatar e info utente */
.header_prioritario {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.tag_tipo_richiesta {
    min-width: 140px;
    justify-content: center;
    letter-spacing: 1px;
}

/*avatar nome e ranking allineati verticalmente e distanziati */
.header_richiesta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* singola richiesta  */
:deep(.n-list-item) {
    padding: 1.5rem !important; /* padding aumentato per non avere contenuto troppo vicino ai bordi */
    border-radius: var(--border-radius)!important;
    margin-bottom: 0.75rem; /* margine tra una richiesta e l'altra */
    transition: all 0.3s ease;
    border-left: 6px solid #d9d9d9; /* bordo laterale sinistro, default grigio ma colorato in base al tipo di richiesta */
}

/* stile Richiesta Inviata  */
.item_inviato {
    border-left-color: #2080f0 !important;
    background-color: rgba(32, 128, 240, 0.02);
}

/* stile Richiesta Ricevuta */
.item_ricevuto {
    border-left-color: #18a058 !important;
    background-color: rgba(24, 160, 88, 0.02);
}

:deep(.n-list-item:hover) {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* contenitore della valutazione utente*/
.badge_voti {
    display: flex;
    align-items: center; /* centra verticalemnte stella e numero */
    gap: 4px; /* distanza stella e numero */
    background: #fff8e6;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid #ffe58f;
}

/* testo (numero) relativo alla valutazione utente*/
.testo_voto { 
    font-size: 0.85rem;
    font-weight: bold;
    color: #d48806; 
}

/*username utente */
.nome_utente_enfasi { 
    font-weight: bold;
    color: var(--color-text-dark); 
}

/* Sezione con titolo del libro richiesto */
.info_libro_richiesto { 
    margin-top: 0.5rem; 
}
.label_grigia_bio {
    color: #8c8c8c; 
    font-size: 0.9rem; 
}
.titolo_libro_info { 
    font-weight: 500; 
    font-style: italic; 
    color: #1f1f1f; }


.periodo_condivisione {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
    color: var(--color-text-dark);
}

/* modale recensione posizionamento stelle */
.stelle_centrate { 
    width: 100%; 
    display: flex; 
    justify-content: center; 
    padding: 1rem 0; 
}

/*sezione dedicate alle note della richiesta */
.testo_note {
    font-style: italic;
    color: #595959;
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    margin: 0;
    border-left: 2px solid #d9d9d9;
}

/* bottoni azioni */
.area_azioni_condivisione {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
}

.n-list.n-list--bordered {
    border: none;
}


/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .header_prioritario {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .tag_tipo_richiesta { 
        width: 100%;
    }
    .area_azioni_condivisione { 
        flex-direction: column; 
    }
    .area_azioni_condivisione :deep(.n-button) { 
        width: 100%; 
    }
}
</style>
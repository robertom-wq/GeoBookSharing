<template>
  <div class="page">
    <div class="intestazione">
      <h1>Supervisione</h1>
      <p class="sottotitolo">Pagina di controllo per i supervisori</p>
    </div>
    <div class="contenuto_amministrazione">
      <!--  tab per navigazione operazioni amministratore -->
      <n-tabs type="card" animated class="distanziatore_verticale">
        <!-- statistiche varie -->
        <n-tab-pane name="dashboard" tab="Dashboard Generale">
          <n-grid cols="1 s:2 m:3" x-gap="12" y-gap="12" responsive="screen">
            <n-gi>
              <!-- totale utenti registrati -->
              <n-card size="small" class="scheda_altezza_massima">
                <n-statistic label="Utenti Totali" :value="nr_utenti_totali" />
              </n-card>
            </n-gi>
            <n-gi>
              <!-- libro con maggior numero di visualizzazioni -->
              <n-card size="small" class="scheda_altezza_massima">
                <n-statistic label="Top Visualizzati Libri" :value="libri_top[0]?.visualizzazioni" />
              </n-card>
            </n-gi>
            <n-gi>
              <!-- conteggio errori api giornalieri -->
              <n-card size="small" class="scheda_altezza_massima">
                <n-statistic label="Errori API Oggi" :value="conteggio_errori_oggi" />
              </n-card>
            </n-gi>
          </n-grid>
          <!-- sezione ranking e grafici -->
          <n-grid cols="1 m:2" x-gap="16" y-gap="16" responsive="screen" class="distanziatore_verticale">
            <n-gi>
              <!-- lista libri ordinata per visualizzazioni -->
              <n-card title="Top 5 Libri più visitati" class="scheda_altezza_massima">
                <n-list bordered hoverable>
                  <n-list-item v-for="(libro, index) in libri_top.slice(0, 5)" :key="libro.id">
                    <n-thing>
                      <template #header>
                        <n-space align="center" :size="10">
                          <n-badge :value="index + 1" :type="index === 0 ? 'success' : 'info'"
                            :color="index > 2 ? '#999' : ''" />
                          <span>{{ libro.titolo }}</span>
                        </n-space>
                      </template>
                      <!-- numero visualizzazioni -->
                      <template #description>{{ libro.visualizzazioni }} visualizzazioni</template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-card>
            </n-gi>

            <n-gi>
              <n-card title="Analisi Generi più ricercati" class="scheda_altezza_massima">
                <div class="area_grafico_generi">
                  <GraficoATorta v-if="libri_top.length > 0" :chart-data="dati_per_grafico"
                    :chart-options="opzioni_grafico" />
                  <n-empty v-else description="Caricamento dati..." />
                </div>
              </n-card>
            </n-gi>
          </n-grid>
        </n-tab-pane>
        <!-- gestione utenti-->>
        <n-tab-pane name="utenti" tab="Gestione Utenti">
          <!-- avviso per dispositivi mobili rotazione schermo-->
            <div class="avviso_rotazione_local">
                <n-icon size="40">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h2l-3 3l-3-3h2c-.35-3.11-2.2-5.74-4.89-7.04L16.48 2.52zM8.23 21H16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H8.23c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zM8 5h8v14H8V5zM7.52 21.48C4.25 19.94 1.91 16.76 1.55 13h-2l3-3l3 3h-2c.35 3.11 2.2 5.74 4.89 7.04l-1.03 1.44z" fill="currentColor"/></svg>
                </n-icon>
                <span>Ruota lo schermo per gestire gli utenti</span>
            </div>
            <n-card title="Anagrafica e Permessi" class="scheda_utenti_container">
                <n-space vertical size="large">
                    <n-flex class="area_filtri_utenti">
                        <n-input v-model:value="q" placeholder="Cerca username, email..." clearable class="input_ricerca_utente" />
                        <n-flex>
                            <n-checkbox v-model:checked="bannato">Solo Bannati</n-checkbox>
                            <n-checkbox v-model:checked="richiesta_eliminazione">Richiesta Eliminazione</n-checkbox>
                        </n-flex>
                    </n-flex>
                    <div class="contenitore_tabella_adattiva">
                      <n-data-table remote :loading="utenti_store.loading" :columns="colonne_utenti" :data="lista_utenti" :pagination="paginazione" />
                    </div>
                </n-space>
            </n-card>
        </n-tab-pane>
        <!--log -->
        <n-tab-pane name="logs" tab="Log di Sistema">
          <n-card title="Archivio Log Giornalieri">
              <n-grid cols="1 s:2 m:4" x-gap="12" y-gap="12" class="distanziatore_verticale" responsive="screen">
                <n-gi>
                    <n-select v-model:value="filtro_livello" :options="opzioni_livello" placeholder="Filtra Livello" clearable />
                </n-gi>
                <n-gi>
                    <n-date-picker v-model:value="data_selezionata" type="date" style="width: 100%" />
                </n-gi>
                <n-gi>
                    <n-button type="primary" block secondary @click="getLogs" :loading="loading_logs">
                    Ricarica Log
                    </n-button>
                </n-gi>
              </n-grid>

              <n-data-table 
                :columns="colonne_log" 
                :data="logs_filtrati" 
                :pagination="{ pageSize: 12 }" 
                :loading="loading_logs" 
                :max-height="500" 
                size="small" 
                :row-props="proprietaRiga"
                :scroll-x="800" 
              />
              <n-empty v-if="dati_log.length === 0 && !loading_logs" description="Nessun log trovato per questa data" class="distanziatore_verticale" />
          </n-card>
          <n-modal v-model:show="mostra_modale_log" preset="card" title="Dettaglio Log" class="testo_messaggio_log">
              <div v-if="log_selezionato">
                <n-descriptions label-placement="left" bordered :column="1">
                    <n-descriptions-item label="Timestamp">{{ new Date(log_selezionato.timestamp).toLocaleString() }}</n-descriptions-item>
                    <n-descriptions-item label="Livello">
                    <n-tag :type="getTipoMessaggio(log_selezionato.level)" :bordered="false">{{ log_selezionato.level.toUpperCase() }}</n-tag>
                    </n-descriptions-item>
                    <n-descriptions-item label="Messaggio">
                    <div style="white-space: pre-wrap; word-break: break-all;">{{ log_selezionato.message }}</div>
                    </n-descriptions-item>
                </n-descriptions>
                <n-card v-if="has_dati_extra" title="Dati Aggiuntivi" size="small" class="distanziatore_verticale scheda_dati_extra">
                    <pre class="codice_dati_json">{{ dati_extra }}</pre>
                </n-card>
              </div>
          </n-modal>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NTag, NButton, NSpace, NDatePicker, NSelect, NModal, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { chiamaAPI } from '@/services/clientApi'
import { useUtentiStore } from '@/stores/utentiStore'
import { useLibriStore } from '@/stores/libriStore'
import GraficoATorta from '@/components/GraficoATorta.vue'


const utenti_store = useUtentiStore()
const libri_store = useLibriStore()
const message = useMessage()
const router = useRouter()

// Stati
const libri_top = ref([])
const lista_utenti = ref([])
const nr_utenti_totali = ref(0)
const dati_log = ref([])
const loading_logs = ref(false)
const data_selezionata = ref(Date.now())
const filtro_livello = ref(null)
const mostra_modale_log = ref(false)
const log_selezionato = ref(null)
const larghezza_finestra = ref(window.innerWidth)

// Parametri di ricerca
const q = ref('')
const bannato = ref(null)
const richiesta_eliminazione = ref(null)
const pagina = ref(1)
const limit = ref(10)
const conteggio_utenti = ref(0) 

// Utilizzo un computed per raggruppare i parametri così da inviarli puliti alle API
const parametri_query = computed(() => ({
    q: q.value,
    bannato: bannato.value,
    richiesta_eliminazione: richiesta_eliminazione.value,
    pagina: pagina.value,
    limit: limit.value
}))

const opzioni_livello = [
    { label: 'INFO', value: 'info' }, 
    { label: 'WARNING', value: 'warn' }, 
    { label: 'ERROR', value: 'error' }
]

const getDataFormattata = (data_obj) => {
    const d = new Date(data_obj)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Mapping per i colori dei tag nel log
const tag_messaggi_log = {
  error: 'error',
  warn: 'warning',
  info: 'info'
}

const getTipoMessaggio = (livello) => {
  return tag_messaggi_log[livello] || 'default'
}

const data_formattata = computed(() => getDataFormattata(data_selezionata.value))
const conteggio_errori_oggi = computed(() => dati_log.value.filter(l => l.level === 'error').length)
const logs_filtrati = computed(() => filtro_livello.value ? dati_log.value.filter(l => l.level === filtro_livello.value) : dati_log.value)

//estraggo i dati extra dal log (tutto ciò che non è timestamp o messaggio)
const dati_extra = computed(() => {
    if (!log_selezionato.value) return ''
    const { timestamp, level, message, ...rest } = log_selezionato.value
    return JSON.stringify(rest, null, 2)
})

// verifico esistono dati oltre ['timestamp', 'level', 'message'] contenenti i dettagli dell'errore in modo 
// da mostrarli nell'apposito modale
const has_dati_extra = computed(() => {
    return log_selezionato.value && Object.keys(log_selezionato.value).some(k => !['timestamp', 'level', 'message'].includes(k))
})

// Gestione della paginazione per Naive UI
const paginazione = computed(() => ({
    // i tre sensosi in ascolto
    page: pagina.value,
    pageSize: limit.value,
    itemCount: conteggio_utenti.value,
    onChange: (p) => {
        pagina.value = p
        getUtenti()
    }
}))


// Preparo i dati per il grafico a torta dei generi
const dati_per_grafico = computed(() => {
    const statistiche = {}
        //console.log("top",libri_top.value)

    libri_top.value.forEach(l => {
        const g = l.genere?.dettagli || 'Altro'
        statistiche[g] = (statistiche[g] || 0) + (Number(l.visualizzazioni) || 0)
    })
    const labels = Object.keys(statistiche)
    //console.log("Labels",labels)
    return {
        labels,
        datasets: [{
            label: 'Visite',
            //Uso il formato HSL (Hue, Saturation, Lightness)
            //Divido il cerchio cromatico per il numero totale di generi trovati
            //i colori del grafico saranno sempre diversi tra loro e distribuiti, qualunque numero di categorie.
            //_ parametro ignorato
            backgroundColor: labels.map((_, i) => `hsl(${(i * 360) / labels.length}, 70%, 60%)`),
            data: Object.values(statistiche)
        }]
    }
})

const opzioni_grafico = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }

//configurazione tabelle
const proprietaRiga = (riga) => ({
    style: 'cursor: pointer',
    onClick: () => {
        log_selezionato.value = riga
        mostra_modale_log.value = true
    }
})

//settaggio delle colonne dei log
const colonne_log = [
    { title: 'Orario', key: 'timestamp', width: 180, render: (riga) => new Date(riga.timestamp).toLocaleString() },
    { title: 'Livello', key: 'level', width: 100, render: (riga) => h(NTag, { type: getTipoMessaggio(riga.level), size: 'small', bordered: false }, { default: () => riga.level.toUpperCase() }) },
    { title: 'Messaggio', key: 'message', ellipsis: true }
]

//settaggio delle colonne utenti
const colonne_utenti = [
    { title: 'ID', key: 'id', width: 70 },
    { title: 'Username', key: 'username' },
    //Il parametro riga viene passato direttamente e implicitamente dal componente <n-data-table>
    //Per ogni utente, Naive UI esegue la funzione e invia l'oggetto dell'utente corrente come primo argomento.
    { title: 'Stato', render: (riga) => {
        //t rappresenta un array di stati, infatti potrebbe essere che un utente si trovi
        //sia in uno stato di bannato che in eliminazione
        const t = []
        if (riga.bannato) t.push({ type: 'error', label: 'BANNATO' })
        if (riga.richiesta_eliminazione) t.push({ type: 'warning', label: 'ELIMINAZIONE' })
        if (!t.length) t.push({ type: 'success', label: 'ATTIVO' })
        //h costruisce l'elemento NTag 
        return t.map(stato => h(NTag, { type: stato.type, style: 'margin-right: 5px', bordered: false }, { default: () => stato.label }))
    }},
    //h costruisce l'elemento NButton 
    { title: 'Azioni', key: 'actions', render: (riga) => h(NButton, { size: 'small',
                                                                      ghost: true,
                                                                      type: 'primary',
                                                                      onClick: () => router.push({ name: 'AdminProfilo', params: { id: riga.id } }) },
                                                                      { default: () => 'Gestisci' }) }
]

//recupero i dati di tutti gli utenti
async function getUtenti() {
    try {
        const res = await utenti_store.getAllUtenti(parametri_query.value)
        lista_utenti.value = res.data
        conteggio_utenti.value = res.conteggioTotale
        nr_utenti_totali.value = res.conteggioTotale
    } catch (err) {
        message.error('Errore caricamento utenti')
    }
}

//recupero i dati di tutti i log della data selezionata.
//La chiamata è protetta a livello backend, solo gli admin possono eseguirla
async function getLogs() {
    loading_logs.value = true
    try {
        const logs = await chiamaAPI(`/admin/system-logs?date=${data_formattata.value}`)
        dati_log.value = Array.isArray(logs) ? logs : []
    } catch (err) {
        dati_log.value = []
        console.error("Errore getLogs:", err)
    } finally {
        loading_logs.value = false
    }
}


// Aggiorno istantaneamente la tabella dei log visualizzando i dati relativi al nuovo giorno scelto
//appena data_selezionata cambia
watch(data_selezionata, getLogs)

// Quando cambio la stringa di ricerca, riporto alla prima pagina per non perdere i risultati
watch(q, () => {
    pagina.value = 1
    getUtenti()
})

// Monitora i filtriBannato o Richiesta Eliminazione e aggiorna pagina e utenti
watch([bannato, richiesta_eliminazione], () => {
    pagina.value = 1
    // se tolgo la spunta dalla checkbox vedra i due parametri come false e filtrerà l'intera ricerca cercando
    // gli utenti con bannato = false e/o richiesta_eliminazione = false. situazione non voluta
    //percio li resetto a null se passano da true a false
    bannato.value = bannato.value ? bannato.value : null
    richiesta_eliminazione.value = richiesta_eliminazione.value ? richiesta_eliminazione.value : null
    getUtenti()
})


onMounted(async () => {
    try {
        // Ho impostato il Promise.all per caricare i dati in parallelo e non rallentare l'avvio
        const [risultato_libri] = await Promise.all([
            libri_store.getLibriTopVisitati(),
            getUtenti(),
            getLogs()
        ])
        libri_top.value = risultato_libri || []

      } catch (err) {
        console.error("Errore durante il caricamento iniziale:", err)
    }
})
</script>

<style scoped>
.pagina_supervisione {
  padding: 2vw;
  max-width: var(--container-max-width, 88rem);
  margin: 0 auto;
}

.testata_sezione {
  margin-bottom: 2rem;
}

.testo_descrizione {
  font-size: clamp(1rem, 2vw, 1.15rem);
  opacity: 0.8;
}

.distanziatore_verticale {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.scheda_altezza_massima {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.area_grafico_generi {
  height: clamp(15rem, 40vh, 25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.input_ricerca_utente {
  width: 100%;
  max-width: 25rem; 
}

.contenitore_tabella_adattiva {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.modale_dettaglio_log) {
  width: 95vw !important;
  max-width: 37.5rem !important; 
}

:deep(.n-space){
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 1rem !important;
  padding-bottom: 2rem;
}

.testo_messaggio_log {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  background: #f8f8f8;
  padding: 0.75rem;
  border-radius: 4px;
}

.scheda_dati_extra {
  background-color: #f4f4f4;
  margin-top: 1rem;
}

.codice_dati_json {
  font-size: 0.75rem; 
  overflow: auto;
  max-height: 15rem;
}
/* contenitore specifico per l'avviso dentro il tab utenti */
.avviso_rotazione_local {
    display: none; /*nascosto di default su desktop e landscape*/
    background-color: var(--n-card-color); /*usa lo stesso colore delle card di naive*/
    border: 1px dashed #ccc; /*bordo tratteggiato*/
    border-radius: 8px;
    padding: 3rem 1rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: center;
}

/* animazione dell'icona */
.avviso_rotazione_local n-icon {
    animation: rotate-hint 3s infinite ease-in-out; /*suggerimento visivo della rotazione*/
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
  .area_filtri_utenti {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 1rem;
  }

  .input_ricerca_utente {
    max-width: 100%;
  }
}

/* logica di attivazione mirata solo alla sezione utenti */
@media (max-width: 600px) and (orientation: portrait) {
    
    /* mostra l'avviso locale */
    .avviso_rotazione_local {
        display: flex; /*appare solo quando il dispositivo è in verticale*/
    }

    /* nasconde la card con la tabella per non creare confusione */
    .scheda_utenti_container {
        display: none !important; 
    }
}

@keyframes rotate-hint {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(90deg); }
}
</style>
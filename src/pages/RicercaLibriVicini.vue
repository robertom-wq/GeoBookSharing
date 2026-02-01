<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- intestazione della pagina -->
            <div class="intestazione">
                <h1>Cerca Libri</h1>
                <!-- sottotitolo -->
                <p class="sottotitolo">Ciao {{ utenti_store.utente?.nome.toUpperCase() }}. Trova i libri
                    disponibili nelle librerie di altri
                    utenti attorno a te. Seleziona un'area e avvia la ricerca.
                </p>
            </div>
            <!-- contenitore della ricerca libro -->
            <div class="contenuto_ricerca">
                <!-- spinner caricamento dei libri -->
                <n-spin :show="libri_store.loading">
                    <!-- Contenitore mappa -->
                    <div id="scheda_mappa_ricerca">
                        <Mappa 
                        :dati_libri="libri_in_mappa"
                        :is_home_scaffali="false"
                        :is_cerca_libri_vicini="true"
                        :centra_mappa="centro_iniziale"
                        @update:coords="gestisciMovimentoMappa"
                        />
                    </div>
                        <!--controlli ricerca-->
                        <n-flex class="barra_controlli_ricerca">
                            <!-- ricerca per titolo o autore -->
                            <n-input
                            v-model:value="query_ricerca"
                            placeholder="Cerca titolo o autore..."
                            clearable
                            class="input_ricerca_testo" />
                            <!-- selezione raggio di ricerca -->
                            <n-select 
                            v-model:value="distanza"
                            :options="opzioni_distanza"
                            class="selettore_raggio"/>

                            <n-button 
                            type="primary"
                            @click="eseguiRicerca"
                            :loading="libri_store.loading"
                            :disabled="!is_ricerca_valida">
                            Cerca sulla mappa
                            </n-button>
                        </n-flex>
                    
                </n-spin>
                <n-divider/>
                <!--nessun risulato-->
                <n-empty description="Nessun Libro trovato per la ricerca" v-if="!ricerca_ha_risultati" />

                <!-- risultati ricerca-->
                <div v-else>
                    <!-- conteggio libri trovati -->
                    <n-h2>Libri Trovati: {{ libri_store.libri_all.length }}</n-h2>
                    <!-- griglia risultati -->
                    <div class="griglia_risultati_libri">
                        <div v-for="libro in libri_paginati" :key="libro.id">
                            <!-- card singolo libro -->
                            <LibriCard
                                :titolo="libro.titolo"
                                :immagine="libro.copertina"
                                :info_autore="libro.autore"
                                :info_anno="libro.anno"
                                :info_scaffale_proprietario="libro.proprietario.username.toUpperCase()"
                                :info_distanza_km="libro.distanza_km"
                                :visualizza_footer="true"
                                @click-dettagli-libro="vaiAlLibro(libro.id)"
                                @click-richiedi-condivisione="richiediCondivisione(libro.id)"
                                />
                        </div>
                    </div>
                    <!--pagination-->
                    <n-flex justify="center" class="area_paginazione">
                        <n-pagination
                            v-model:page="pagina_corrente"
                            :item-count="libri_store.libri_all.length"
                            :page-size="libri_per_pagina"
                            show-size-picker
                            :page-sizes="opzioni_limit_ricerca"
                            @update:page-size="(val) => libri_per_pagina = val"
                        />
                    </n-flex>
                </div>
            </div>

        </section>
    </div>

</template>

<script setup>
import { useUtentiStore } from '@/stores/utentiStore'
import { useLibriStore } from '@/stores/libriStore'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Mappa from '@/components/Mappa.vue'
import LibriCard from '@/components/LibriCard.vue'
import { useMessage } from 'naive-ui'
import { NPagination } from 'naive-ui'

const utenti_store = useUtentiStore()
const libri_store = useLibriStore()
const router = useRouter()
const message = useMessage()

//STATI
const query_ricerca = ref('')
const distanza = ref(5) // default 5km
const limit_ricerca = ref(null)
const coordinate_centro_mappa = ref({ lat: 45.6667, lng: 12.2416, zoom: 15 }) // coordinate di default
const pagina_corrente = ref(1)
const libri_per_pagina = ref(5) // numero di card visibili per volta

// calcolo libri da mostrare in base alla pagina attiva
const libri_paginati = computed(() => {
    const inizio = (pagina_corrente.value - 1) * libri_per_pagina.value
    const fine = inizio + libri_per_pagina.value
    return libri_store.libri_all.slice(inizio, fine)
})

// configurazione opzioni per selettore distanza
const opzioni_distanza = [
    {label: '1 km', value: 1},
    {label: '5 km', value: 5},
    {label: '10 km', value: 10},
    {label: '25 km', value: 25},
    {label: '50 km', value: 50},
]
// configurazione opzioni per selettore distanza
const opzioni_limit_ricerca = [
    {label: '5 libri', value: 5},
    {label: '10 libri', value: 10},
    {label: '50 libri', value: 50},
    {label: '100 libri', value: 100} 
]

const is_ricerca_valida = computed(()=>{
    return !!coordinate_centro_mappa && !!distanza.value
})

// raggruppo libri per scaffale unico per evitare duplicati sulla mappa
const libri_in_mappa = computed(()=>{
    //verifico che i dati esistano e siano un array prima di procedere.
    if(!libri_store.libri_all || !Array.isArray(libri_store.libri_all)){
        return []
    }
    //ho bisogno di un elenco che contenga tutti gli scaffali, contati una sola volta. per es se cerco per autore
    //nella stessa libreria potrebbero esserci piu libri e mi verrebbe conteggiato piu volte lo stesso scaffale.
    //con le posizioni geografiche per usarle sulla mappa. per questo uso map
    const scaffali_unici = new Map()

    libri_store.libri_all.forEach(libro => {
        const id_scaffale = libro.scaffale?.id

        if (id_scaffale && !scaffali_unici.has(id_scaffale)){
            // se lo scaffale non è ancora mappato lo aggiungo con le coordinate parsate
            scaffali_unici.set( id_scaffale, {
                id: id_scaffale,
                nome: libro.scaffale.nome,
                lat: libro.lat,
                lng: libro.lng,
                //aggiungo qui eventuali altre info da mostrare nel popup della mappa
            })
        }
    })
    //La map viene convertita in un Array di oggetti, formato richiesto dai componenti mappa di Leaflet
    return Array.from(scaffali_unici.values())
})

const ricerca_ha_risultati = computed(()=>{
    return libri_store.libri_all && libri_store.libri_all.length > 0
})

const centro_iniziale = computed(()=>{
    if (coordinate_centro_mappa.value) {
        return coordinate_centro_mappa.value
    }
    return { lat: 45.6667, lng: 12.2416, zoom: 15 }
})

//AZIONI
// aggiorno coordinate quando utente sposta il cursore sulla mappa
function gestisciMovimentoMappa(coordinate) {
    coordinate_centro_mappa.value = {
        lat: coordinate.lat,
        lng: coordinate.lng,
        zoom: coordinate.zoom || 15
    }
}

// invia i parametri al backend
async function eseguiRicerca() {
    if (!is_ricerca_valida.value) {
        message.warning("Seleziona una posizione e un raggio di ricerca validi")
        return
    }
    const dati_query = {
        lat: coordinate_centro_mappa.value.lat,
        lng: coordinate_centro_mappa.value.lng,
        dist: distanza.value * 1000, // conversione in metri per api
        limit: limit_ricerca.value,
        q: query_ricerca.value || undefined
    }
    console.log("limite", dati_query.limit)

    try {
        const libri_trovati = await libri_store.getLibriVicini(dati_query);

        if(!ricerca_ha_risultati) {
            message.info("Ricerca completata, nessun libro trovato nel raggio selezionato!")
        } else {
            message.success(`Trovati ${libri_store.libri_all.length} libri in ${libri_in_mappa.value.length} librerie!`)
        }
    } catch (err) {
        message.error(err.message || 'Errore durante la ricerca dei libri vicini!')
    }
}

function vaiAlLibro(id) {
    router.push({name: 'ModificaLibro', params:{id}})
}

function richiediCondivisione(id){
    router.push({ name: 'RichiestaCondivisione', params: { id }})
}

// resetto risultati ricerca alla chiusura o caricamento
onMounted(()=>{
    libri_store.resetLibriVicini()
})

</script>

<style scoped>

/* spaziatura per titolo e descrizione della pagina */
.testata_sezione {
    margin-bottom: 2rem;
}

/* font del sottotitolo dinamico */
.testo_sottotitolo {
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.5;
    opacity: 0.9;
}

/* contenitore mappa con altezza dinamica e bordi arrotondati */
#scheda_mappa_ricerca {    
    width: 100%;
    height: clamp(20rem, 50vh, 35rem); /* altezza si adatta alla dimensione dello schermo */
    overflow: hidden !important;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
    border: 0.0625rem solid #eee;
    position: relative;
}

/* forza il componente mappa a riempire tutto lo spazio della card */
#scheda_mappa_ricerca :deep(.sezione_mappa_inner),
#scheda_mappa_ricerca :deep(.mappa_container) {
    height: 100% !important;
    max-height: 100% !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 1rem;
}

.ricerca_localita {
    width: 95%;
}

/* barra dei controlli, input ricerca e dropdown, centrata con spaziatura tra elementi  */
.barra_controlli_ricerca {
    margin-bottom: 1.5rem;
    gap: 1rem !important;
    display: flex;
    justify-content: center!important;

}

/* limiti di larghezza per i campi di input su desktop */
.input_ricerca_testo {
    max-width: 20rem; 
}

.selettore_raggio {
    max-width: 10rem; 
}

/* griglia dei risultati */
.griglia_risultati_libri {
    display: flex;
    flex-wrap: wrap;
    gap: 1.6rem; 
    width: 100%;
    justify-content: center;
    margin-top: 1.5rem;
}

/* paginazione */
.area_paginazione {
    margin-top: 2.5rem; 
    margin-bottom: 1.25rem;
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {

    /* I controlli di ricerca passano da riga a colonna */
    .barra_controlli_ricerca {
        flex-direction: column !important;
        align-items: stretch !important;
    }

    .input_ricerca_testo, 
    .selettore_raggio {
        max-width: 100%; /* Occupano tutta la larghezza */
    }

    :deep(.n-button) {
        width: 100% !important;
        height: 2.3rem;
        font-size: 1.2rem;
    }

    #scheda_mappa_ricerca {
        height: 28rem; /* Altezza fissa aumentata per l'uso touch della mappa */
    }

    .griglia_risultati_libri {
        gap: 1rem;
    }

}
</style>
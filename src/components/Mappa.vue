<template>
    <!-- contenitore principale della sezione mappa -->
    <div class="sezione_mappa_inner">
        <!-- sezione di ricerca localita visibile solo se non siamo nella home scaffali -->
        <div v-if="!is_home_scaffali" class="ricerca_localita">
            <div class="ricerca_indirizzo">

                <!-- barra con azioni posizione attuale, precisione gps e ricerca indirizzo -->
                <n-space>
                    <!-- bottone per centrare la mappa sulla posizione attuale -->
                    <n-button @click="ottieniPosizioneAttuale" type="info" primary ghost
                        title="Centra mappa sulla tua posizione attuale" size="small">
                        Mia Posizione
                        <template #icon>
                            <n-icon>
                                <LocationSharp />
                            </n-icon>
                        </template>
                    </n-button>
                    <!-- checkbox per abilitare o disabilitare alta precisione gps -->
                    <n-checkbox v-model:checked="alta_precisione">
                        Alta precisione (GPS)
                    </n-checkbox>
                    <!-- input per la ricerca manuale di un indirizzo -->
                    <n-input v-model:value="query_ricerca" placeholder="Cerca indirizzo..."
                        @input="gestisciInputRicerca" clearable />
                </n-space>

                <!-- lista dei risultati ottenuti dalla ricerca indirizzi -->
                <div class="elementi_trovati" v-if="risultati_ricerca.length > 0">
                    <div class="elementi_trovati_inner" v-for="indirizzo in risultati_ricerca" :key="indirizzo.place_id"
                        @click="selezionaIndirizzo(indirizzo)">
                        {{ indirizzo.display_name }}
                    </div>
                </div>
            </div>
        </div>
        <!-- contenitore della mappa leaflet -->
        <div class="mappa_container">
            <!-- spinner visibile durante il caricameto della mappa -->
            <div class="spinner_container" v-if="is_loading">
                <n-spin size="large" description="Caricamento Mappa...">
                </n-spin>
            </div>
            <!-- componente mappa principale -->
            <LMap v-model:zoom="zoom" :center="[centratura_mappa.lat, centratura_mappa.lng]" @ready="mappaPronta">
                <!-- layer base openstreetmap -->
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
                </LTileLayer>
                <!-- marker draggabile per selezionare manualmente una posizione -->
                <LMarker v-if="!is_home_scaffali" :lat-lng="coordinate_marker" draggable 
                    @moveend="gestisciMovimentiMarker">
                    <LIcon
                        icon-url="/markers/marker-icon-2x-blue.png"
                        shadow-url="/markers/marker-shadow.png"
                        :icon-size="[25, 41]"
                        :icon-anchor="[12, 41]"
                        :popup-anchor="[1, -34]"
                        :shadow-size="[41, 41]"
                    />
                </LMarker>
                <!-- marker degli scaffali mostrati nella home -->
                 <template v-if="is_home_scaffali">
                        <LMarker v-for="scaffale in scaffali_validi" 
                            :key="scaffale.id" :lat-lng="[scaffale.lat, scaffale.lng]"
                            :draggable="false">
                            <LIcon
                                icon-url="/markers/marker-icon-2x-red.png"
                                shadow-url="/markers/marker-shadow.png"
                                :icon-size="[25, 41]"
                                :icon-anchor="[12, 41]"
                                :popup-anchor="[1, -34]"
                                :shadow-size="[41, 41]"
                            />
                            <!-- tooltip con il nome dello scaffale -->
                            <LTooltip>{{ scaffale.nome }}</LTooltip>
                            <LPopup>
                                <a style="font-weight: bold;">Nome</a>{{ scaffale.nome }}
                                <a style="font-weight: bold;">Descrizione</a>{{ scaffale.descrizione }}
                            </LPopup>
                        </LMarker>
                </template>
                <!-- marker dei libri trovati nelle vicinanze -->
                <template v-if="is_cerca_libri_vicini">
                    <LMarker
                        v-for="libro in props.dati_libri"
                        :key="libro.id"
                        v-show="libro.lat != null && libro.lng != null"
                        :lat-lng="[libro.lat,libro.lng]"
                        title="Posizione Libro"
                        :draggable="false">
                        <LIcon
                            icon-url="/markers/marker-icon-2x-red.png"
                            shadow-url="/markers/marker-shadow.png"
                            :icon-size="[25, 41]"
                            :icon-anchor="[12, 41]"
                            :popup-anchor="[1, -34]"
                            :shadow-size="[41, 41]"
                        />
                        <!-- tooltip con il nome del libro -->
                        <LTooltip>{{ libro.nome }}</LTooltip>
                    </LMarker>
                </template>
            </LMap>
        </div>
    </div>
</template>

<script setup>
import { LocationSharp } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { LMap, LTileLayer, LMarker, LTooltip, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import { ref, defineEmits, defineProps, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const message = useMessage()

// configurazioni di base. centro mappa di default se non ci sono coordinate
const default_center = { lat: 45.6667, lng: 12.2416, zoom: 15 }
const emit = defineEmits(['update:coords'])

// configurazione icone personalizzate per leaflet
delete leaflet.Icon.Default.prototype._getIconUrl
leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: '/markers/marker-icon-2x-blue.png',
    iconUrl: '/markers/marker-icon-2x-blue.png',
    shadowUrl: '/markers/marker-shadow.png',
})


// STATI
const is_loading = ref(true) // mostra lo spinner mentre carica
const zoom = ref(15)
const mappa_ref = ref(null) // riferimento alla mappa
const query_ricerca = ref("") // testo per la ricerca indirizzo
const risultati_ricerca = ref([]) // array risultati ricerca
const alta_precisione = ref(false) // opzione gps alta precisione

// evita crash resize al cambio pagina
let timer_aggiornamento_mappa = null

// props ricevute dal componente padre
const props = defineProps({
    dati_scaffali: { type: Array, default: () => [] },
    is_home_scaffali: { type: Boolean, default: false },
    centra_mappa: { type: Object, default: () => ({ lat: 45.4642, lng: 12.1900 }) },
    is_cerca_libri_vicini: { type: Boolean, default: false },
    dati_libri: { type: Array, default: () => [] }
})

//evita che vue ricrei l'array ad ogni render facendo sparire i marker
const scaffali_validi = computed(() => {
    return props.dati_scaffali.filter(s => {
        // devono esistere, avere lat/lng e questi non devono essere null/undefined
        return s && 
               s.lat !== null && s.lat !== undefined && 
               s.lng !== null && s.lng !== undefined
    })
})

// computed per centrare la mappa, se le coordinate sono vuote o zero, usa il default
const centratura_mappa = computed(() => {
    const { lat, lng } = props.centra_mappa
    if ((lat === 0 && lng === 0) || lat === undefined || lng === undefined) {
        return default_center
    }
    return props.centra_mappa
})

// coordinate del marker mobile
const coordinate_marker = ref([centratura_mappa.value.lat, centratura_mappa.value.lng])

//forza aggiornamento della dimensione mappa usa un timeout e controlla se il componente esiste ancora
function forzaAggiornamentoMappa() {
    // se c'è un timer attivo, lo cancella
    if (timer_aggiornamento_mappa)  {
        clearTimeout(timer_aggiornamento_mappa) 
    }

    // imposto un nuovo timer
    timer_aggiornamento_mappa = setTimeout(() => {
        // controlla se la mappa e il suo contenitore esistono ancora
        if (mappa_ref.value && mappa_ref.value._container) {
            try {
                // forza il ricalcolo dimensioni e nasconde spinner
                mappa_ref.value.invalidateSize()
                is_loading.value = false
            } catch (err) {
                console.warn("Resize mappa fallito (componente probabilmente smontato)")
            }
        }
    }, 200)
}

// pulizia timer alla chiusura
onBeforeUnmount(() => {
    if (timer_aggiornamento_mappa) {
        clearTimeout(timer_aggiornamento_mappa)
    }
})

// --- WATCHERS ---
// osservo cambio coordinate dal padre
watch(() => props.centra_mappa, (nuovo_centro) => {
    // Controllo sicurezza, se la mappa non c'è o non ha coordinate valide, esci
    if (!mappa_ref.value || !mappa_ref.value._container || !nuovo_centro) return

    if (nuovo_centro.lat !== undefined && nuovo_centro.lng !== undefined) {
        // sposta la visuale e aggiorna
        mappa_ref.value.setView(
            [nuovo_centro.lat, nuovo_centro.lng],
            nuovo_centro.zoom || 15,
            { animate: true }
        )
        // Usa la funzione sicura
        forzaAggiornamentoMappa()
    }
}, { deep: true })

// osservo i dati degli scaffali. uso nexttick per aspettare che il dom sia pronto.
watch(() => props.dati_scaffali, async (nuoviDati) => {
    if (nuoviDati && nuoviDati.length > 0 && mappa_ref.value && mappa_ref.value._container) {
        await nextTick();
       // doppio controllo dopo l'attesa
        if (mappa_ref.value && mappa_ref.value._container) {
            mappa_ref.value.invalidateSize();
        }
    }
}, { deep: true });

// funzione chiamata quando leaflet è pronto
function mappaPronta(mappa) {
    mappa_ref.value = mappa

    const centro = centratura_mappa.value
    if (centro.lat && centro.lng) {
        mappa_ref.value.setView([centro.lat, centro.lng], centro.zoom || 15)
        
        // Usa la funzione che gestisce loading e timeout
        forzaAggiornamentoMappa()
        console.log("Mappa aggiornata correttamente")
    }
}

// gestisce trascinamento marker e aggiorna coordinate
function gestisciMovimentiMarker(event) {
    const nuove_coordinate = event.target.getLatLng()
    coordinate_marker.value = [nuove_coordinate.lat, nuove_coordinate.lng]
    emit('update:coords', { lat: nuove_coordinate.lat, lng: nuove_coordinate.lng })
}

//RICERCA INDIRIZZO
let timeout_ricerca
let limite_risultati = 5

// debounce aspetta che l'utente finisca di scrivere
function gestisciInputRicerca() {
    clearTimeout(timeout_ricerca) 
    timeout_ricerca = setTimeout(cercaIndirizzo, 200)
}

// chiama api nominatim per cercare indirizzo
async function cercaIndirizzo() {
    if (query_ricerca.value.length < 3) {
        risultati_ricerca.value = []
        return
    }
    // uso proxy di vite
    const url = `/nominatim-api/search?format=json&addressdetails=1&q=${encodeURIComponent(
    query_ricerca.value
        )}&countrycodes=it&limit=${limite_risultati}`

    try {
        const response = await fetch(url) // Non servono più gli headers qui, li mette Vite
        console.log(response.ok)
        if (!response.ok) throw new Error('Errore risposta server')
        const trovati = await response.json()
        risultati_ricerca.value = trovati.slice(0, 5)
    } catch (err) {
        console.error("Errore ricerca Nominatim:", err)
        risultati_ricerca.value = []
    }
}

// funzione esposta al padre per aggiornare mappa e marker manualmente
function aggiornaMappaEMarkers(lat, lng, zoom = 15) {
    is_loading.value = true
    coordinate_marker.value = [lat, lng]

    if (mappa_ref.value && mappa_ref.value._container) {
        mappa_ref.value.setView([lat, lng], zoom, { animate: true })
        forzaAggiornamentoMappa()
    } else {
        is_loading.value = false
    }
    emit("update:coords", { lat, lng })
}

// gestisce click su un risultato della ricerca
function selezionaIndirizzo(indirizzo) {
    const lat = parseFloat(indirizzo.lat)
    const lng = parseFloat(indirizzo.lon)
    aggiornaMappaEMarkers(lat, lng, 13)
    risultati_ricerca.value = []
    query_ricerca.value = indirizzo.display_name
}

// usa geolocalizzazione del browser
function ottieniPosizioneAttuale() {
    if (!("geolocation" in navigator)) {
        message.warning("Il tuo browser non supporta la geolocalizzazione.")
        return
    }
    message.loading("Ricerca posizione in corso...", { duration: 0 })

    navigator.geolocation.getCurrentPosition(
        (position) => {
            message.destroyAll()
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            aggiornaMappaEMarkers(lat, lng, 15)
            message.success("Posizione trovata!")
        },
        (error) => {
            message.destroyAll()
            let messaggio = "Impossibile ottenere la posizione."
            if (error.code === error.PERMISSION_DENIED) {
                messaggio = "Accesso alla posizione negato. Riprova o cerca un indirizzo."
            }
            message.error(messaggio)
        },
        { enableHighAccuracy: alta_precisione.value, timeout: 20000, maximumAge: 5 * 60000 }
    )
}

// espone la funzione per essere usata dai componenti genitori
defineExpose({
    aggiornaMappaEMarkers
})
</script>

<style scoped>
.sezione_mappa_inner {
    width: 100%;
    display: flex;
    height: 100%;
    flex-direction: column;/* layout a colonna per ricerca e mappa */
    gap: 1rem;
}

.ricerca_indirizzo {
    position: relative;
    width: 100%;
    margin-bottom: 0.25rem; 
    flex-shrink: 0;
}

.ricerca_indirizzo :deep(.n-space) {
    align-items: center;
    width: 100%;
    gap: 1rem !important;
}

.ricerca_indirizzo :deep(.n-checkbox) {
    margin-left: 0.5rem;
    margin-top: 0.35rem;
    margin-bottom: 0.35rem;
}

.elementi_trovati {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 2000;
    background: var(--pearl-white-bg);
    border: 0.0625rem solid var(--dark_gray); 
    border-radius: var(--border-radius);
    max-height: 12.5rem;
    overflow-y: auto;
    box-shadow: var(--box-shadow);
}

.elementi_trovati_inner {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
}

.elementi_trovati_inner:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.mappa_container {
   width: 100%;
    flex-grow: 1;
    min-height: 0;
    height: auto !important;
    overflow: hidden;
    border-radius: var(--border-radius);
    position: relative;
}

.spinner_container {
    position: absolute;
    inset: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.leaflet-popup-content) .popup_label {
    font-weight: bold;
    display: block;
    margin-top: 0.5rem;
}


@media (max-width: 768px) {
    .ricerca_indirizzo :deep(.n-space) {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.10rem !important;
    }

    .ricerca_indirizzo :deep(.n-checkbox) {
        margin-left: 0.75rem;
        margin-top: 1.25rem;
        margin-bottom: 0.1rem!important;
        padding: 0.5rem 0;
    }
    
    .ricerca_indirizzo :deep(.n-checkbox-label) {
        font-size: 1rem;
        padding-left: 0.5rem;
    }

    .ricerca_indirizzo :deep(.n-input),
    .ricerca_indirizzo :deep(.n-button) {
        width: 100% !important;
    }

    .mappa_container {
        height: 50vh!important;
    }
}

</style>




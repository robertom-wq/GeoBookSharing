<template>
    <!-- contenitore principale pagina -->
    <div class="page">
        <section>
            <!-- intestazione pagina -->
            <div class="intestazione">
                <h1>Catalogo Master</h1>
                <!-- saluto utente e link guida -->
                <p class="sottotitolo">
                    Ciao, {{ utenti_store.utente?.nome?.toUpperCase() || 'UTENTE' }}.
                    Pubblica il tuo libro in un istante. <br>
                     <a class="link_guida" @click="mostra_info = true">Come funziona?</a>
                </p>
            </div>
            <div class="contenuto_pagina">
                <!-- card ricerca -->
                <n-card class="barra_input">
                    <n-flex justify="center" align="center">
                        <!-- input ricerca titolo o autore -->
                        <n-input v-model:value="query_ricerca" placeholder="Cerca Titolo o Autore..." clearable
                            class="input_ricerca" />
                    </n-flex>
                </n-card>
                <!-- pulsanti azioni -->
                 <div class="azioni_utente">
                 <n-space>
                    <!-- aggiunta libro tramite isbn -->
                    <n-button type="info" ghost @click="mostra_modale_ricercaISBN = true">
                        Aggiungi da ISBN
                    </n-button>
                    <!-- creazione manuale visibile solo admin -->
                    <n-button v-if="utenti_store.utente.ruolo == 'admin'" type="warning" @click="CreateLibroMaster">
                        Crea Manuale
                    </n-button>
                </n-space>
                </div>
            </div>
            <!-- spinner caricamento catalogo -->
            <n-spin :show="libri_master_store.loading">

                <n-divider />
                <!-- catalogo vuoto -->
                <n-empty v-if="libri_master_store.catalogo_master.length === 0" description="Nessun Libro Master trovato nel catalogo"/>
                    <div v-else>
                        <n-flex justify="end" align="center" class="riga_opzioni_visualizzazione">
                            Risultati per pagina
                        <n-select 
                            v-model:value="risultati_pagina"
                            :options="opzioni_limit_ricerca"
                            class="selettore_quantita"
                        />
                        </n-flex>
                        <!-- griglia libri master -->
                        <div class="griglia_libri_master">
                            <div v-for="libro_master in libri_da_visualizzare" :key="libro_master.id">
                                <!-- singolo libro -->
                                <libri-card 
                                    :titolo="libro_master.titolo"
                                    :immagine="libro_master.copertina"
                                    :info_autore="libro_master.autore"
                                    :info_anno="libro_master.anno"
                                    :visualizza_footer="false"
                                    @click-dettagli-libro="vaiALibroMaster(libro_master.id)"
                                />
                            </div>
                        </div>
                        <!-- navigazione pagine -->
                        <n-flex justify="center" class="area_navigazione_pagine">
                            <NPagination v-model:page="pagina_corrente"
                                :page-size="risultati_pagina"
                                :item-count="libri_master_store.totale_libri_master"
                                @update:page="gestioneCambioPagina">

                            </NPagination>
                        </n-flex>
                    </div>
            </n-spin>
        </section>
    </div>
    <!-- modale guida rapida -->
    <n-modal v-model:show="mostra_info" >
         <n-card title="Guida Rapida" class="scheda_informativa" closable @close="mostra_modale_ricercaISBN= false">
            <p>Non vuoi perdere tempo a compilare i dati del tuo libro? Da questa pagina è possibile attingere alle informazioni del tuo Libro
                effettuando una ricerca per titolo o autore, oppure se non dovesse essere presente nel catalogo esegui una ricerca tramite
                codice ISBN.</p>

            <n-divider />

            <h3>1. Cerca nel catalogo</h3>
            <p>Seleziona un libro già esistente: i dati (titolo, autore, copertina) verranno importati
                automaticamente nel tuo nuovo libro.</p>

            <h3>2. Cerca per ISBN</h3>
            <p>Se il libro non è presente, inserisci il codice ISBN. Le informazioni verranno recuperate online. In questo caso aggiungerai
                il nuovo modello anche al catalogo.
            </p>

            <n-divider />

            <n-button class="button_conferma_modale" type="primary" block @click="mostra_info = false">
                Ho capito
            </n-button>
        </n-card>
    </n-modal>
    <!-- modale ricerca isbn -->
    <n-modal v-model:show="mostra_modale_ricercaISBN">
        <n-card title="Aggiungi Libro tramite ISBN" class="scheda_isbn" closable @close="mostra_modale_ricercaISBN= false">
            <n-space vertical>
                <n-input v-model:value="codice_isbn" placeholder="Inserisci ISBN-10 oppure ISBN-13"/>
                <n-button type="primary" @click="CreateLibroMasterDaISBN" ghost :loading="libri_master_store.loading">Cerca e Aggiungi</n-button>
            </n-space>
            <div></div>
        </n-card>

    </n-modal>
</template>

<script setup>
import { useUtentiStore } from '@/stores/utentiStore'
import { useLibriMasterStore } from '@/stores/libriMasterStore'
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import LibriCard from '@/components/LibriCard.vue'
import { NPagination } from 'naive-ui'


const utenti_store = useUtentiStore()
const libri_master_store = useLibriMasterStore()
const message = useMessage()
const router = useRouter()

// stati e visibilità modali
const mostra_info = ref(false)
const mostra_modale_ricercaISBN = ref(false);
const query_ricerca = ref('')
const codice_isbn = ref('')

// parametri paginazione
const pagina_corrente = ref(1)
const risultati_pagina = ref(10)

// recupero dati dallo store
const libri_da_visualizzare = computed(() => libri_master_store.catalogo_master)

// opzioni per il selettore di risultati per pagina
const opzioni_limit_ricerca = [
    {label: '10', value: 10},
    {label: '50', value: 50},
    {label: '100', value: 100} 
]

// Funzione per caricamento dei libri
async function caricaLibri() {
    await libri_master_store.getLibriMaster(
        query_ricerca.value, 
        pagina_corrente.value, 
        risultati_pagina.value
    )
}

// aggiorna la pagina e riporta la vista in alto
function gestioneCambioPagina(pagina) {
    pagina_corrente.value = pagina
    caricaLibri()
    //scroll della pagina in alto
    window.scrollTo({ top: 0, behavior: 'smooth'})
}

// Avendo optato per una ricerca realtime, osservo la query di ricerca e applico un debounce per evitare
// chiamate ripetute allo store mentre l’utente sta ancorta digitando
let timeout_ricerca = null
watch(query_ricerca, (nuova_query) => {
    clearTimeout(timeout_ricerca);
    timeout_ricerca = setTimeout(() => {
        pagina_corrente.value = 1
        caricaLibri()
    }, 300); // Debounce di 300ms
});

// reset pagina al variare del numero di risultati richiesti
watch(risultati_pagina, () => {
    pagina_corrente.value = 1
    caricaLibri()
})

// creazione nuovo libro tramite isbn
async function CreateLibroMasterDaISBN() {
    console.log(codice_isbn.value)
    if (!codice_isbn.value) {
        message.warning("Inserisci un codice ISBN prima di iniziare la ricerca")
        return
    }
    try {
        const libro_creato = await libri_master_store.createLibroMasterISBN(codice_isbn.value)
        codice_isbn.value = ''
        message.success(libro_creato.message)

    } catch (err) {
        message.error("Errore durante la creazione del libro da Master", err)
    } finally {
        mostra_modale_ricercaISBN.value = false

    }
}
// navigazione verso pagina dettaglio/modifica libro
function vaiALibroMaster(id) {
    router.push( { name: 'ModificaLibroMaster', params:{id}})
}

// navigazione verso pagina creazione manuale libro
function CreateLibroMaster() {
    router.push( {name:'CreaLibroMaster'})
}

onMounted(async ()=> {
    // carico lista di libriMaster
    caricaLibri()
})
</script>

<style scoped>
/* link apertura guida */
.link_guida {
    font-style: italic;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--btn-primary-color, #3194E7);
    text-decoration: underline;
}

/* barra ricerca */
.barra_input {
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
}

/* input ricerca titolo o autore*/
.input_ricerca {
    width: 100%;
    max-width: 18.75rem; 
}

/*selettore risultati per pagina */
.selettore_quantita {
    width: 7.5rem; /* 120px */
}

/* layout flex per elenco libri */
.griglia_libri_master {
    display: flex;
    flex-wrap: wrap;
    gap: 1.625rem;
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    margin-top: 1.25rem;
}

/* Paginazione */
.area_navigazione_pagine {
    margin-top: 3rem;
    padding-bottom: 2rem;
}

/* pulsante conferma modale informazini*/
.button_conferma_modale {
    max-width: 15rem;
    justify-self: center;
}

/* modale scheda informativa */
.scheda_informativa {
    max-width: 90%;
}
.scheda_informativa p {
    margin-bottom: 1rem;
    text-align: justify;
}
.scheda_informativa h3 {
    margin-top: 1.5rem;
    color: var(--btn-primary-color);
}

/* dimensioni finestra ricerca isbn */
.scheda_isbn {
    width: 90vw;
    max-width: 25rem; /* 400px */
}


/*forzo spaziatura e centraggio bottoni*/
.azioni_utente :deep(.n-space) {
    gap: 1rem !important; /* imposta spazio forzato i bottoni */
    justify-content: center !important; /*Bottoni al centro */
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .input_ricerca {
        max-width: 100%;
    }

    .barra_input :deep(.n-space) {
        flex-direction: column;
        width: 100%;
    }

    .scheda_informativa {
        margin-top: 5rem;
        max-width: 95%;
    }

    .barra_input :deep(.n-button) {
        width: 100%;
    }

    .griglia_libri_master {
        gap: 1rem; 
    }

    /* bottoni a tutta larghezza e alti per touch */
    .azioni_utente :deep(.n-space) {
        flex-direction: column !important; /* dispone i bottoni uno sopra l'altro */
    }

    .azioni_utente :deep(.n-button) {
        width: 100%;/* occupa tutta la larghezza */
        height: 2.5rem; /* bottone piu largo, per agevolare touch */
    }
}
</style>
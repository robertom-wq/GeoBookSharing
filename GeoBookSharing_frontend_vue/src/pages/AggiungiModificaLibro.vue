<template>
    <div class="page">
        <section>
            <n-spin :show="loading_libro">
                <div v-show="libro || !loading_libro">

                    <div class="intestazione">
                        <h1>{{ titolo_pagina }}</h1>
                    </div>
                    <p class="sottotitolo">
                    Ciao {{ utenti_store.utente?.nome.toUpperCase() }}, modifica i tuoi libri 
                    </p>
                    <div class="contenuto_modulo">
                        <n-card v-if="form" class="libro_card" :bordered="true" title="Modifica Libro">
                            <n-form :model="form" :rules="rules" ref="form_ref" label-placement="top"
                                :disabled="is_disabilitato">
                                <n-form-item class="sezione_copertina_avatar" label="Copertina">
                                    <div class="avatar_copertina_container">
                                        <n-avatar :src="copertina_src" round size="large" class="avatar_copertina_img"/>
                                        <!--:default-upload="false" perché non voglio che il file venga inviato al back-end appena selezionato
                                        ma solo quando l'utente invia il form-->
                                        <n-upload @before-upload="controlloPreUpload" :show-file-list="false" :default-upload="false"
                                            accept="image/*" :max-count="1" v-model:file-list="lista_files"
                                            @update:file-list="gestisciCaricamentoFile">

                                            <n-button round type="info" ghost size="small">
                                                Upload copertina
                                            </n-button>
                                        </n-upload>
                                    </div>
                                </n-form-item>
                                <n-form-item label="Titolo" path="titolo">
                                    <n-input round v-model:value="form.titolo" />
                                </n-form-item>
                                <n-form-item label="Autore" path="autore">
                                    <n-input round v-model:value="form.autore" />
                                </n-form-item>
                                <n-form-item label="Anno" path="anno">
                                    <n-input round v-model:value="form.anno" />
                                </n-form-item>
                                <n-form-item label="Descrizione" path="descrizione">
                                    <n-input type="textarea" round v-model:value="form.descrizione" :autosize="{
                                        minRows: 3,
                                        maxRows: 6
                                    }" />
                                </n-form-item>
                                <n-form-item v-if="libri_store.sono_proprietario_libro || !libro_id " label="Scaffale"
                                    path="scaffale_id">
                                    <n-select round v-model:value="form.scaffale_id"
                                        :options="lista_scaffali_disponibili" placeholder="Seleziona lo scaffale" />
                                </n-form-item>
                                <n-form-item label="Genere" path="genere_id">
                                    <n-select round v-model:value="form.genere_id" :options="lista_generi"
                                        placeholder="Genere Letterario" />
                                </n-form-item>
                                <n-form-item label="Tipo di Condivisione" path="tipo_condivisione_id">
                                    <n-select round v-model:value="form.tipo_condivisione_id"
                                        :options="lista_tipi_condivisione" placeholder="Tipo di Condivisione" />
                                </n-form-item>
                                <n-divider v-show="libri_store.sono_proprietario_libro" />
                                <div v-show="libri_store.sono_proprietario_libro">
                                    <p>Ultima modifica: {{ data_formattata }}</p>
                                </div>
                                <div  style=" display: flex; font-size: 1.1rem; justify-content: center;">
                                    <p>Visualizzazioni: <span class="statistiche_visualizzazioni">{{ libro?.visualizzazioni }}</span></p>
                                </div>
                                <n-divider />
                            </n-form>
                        </n-card>
                    </div>
                    <div>
                    <!--n-divider/-->
                        <n-space justify="end">
                            <n-button type="info" primary ghost @click="router.back()">Indietro</n-button>
                            <n-button v-if="!libri_store.sono_proprietario_libro && libro_id" type="warning" block
                                @click="richiediCondivisione(libro_id)">Richiedi Libro</n-button>
                            <n-button v-if="libri_store.sono_proprietario_libro || !libro_id" type="warning" block
                                @click="inviaDati" :loading="libri_store.loading">{{ libro_id ? 'Salva' :
                                'Crea'}}</n-button>
                            <n-button v-if="libri_store.sono_proprietario_libro && libro_id" type="error"
                                @click="mostra_modale_conferma = true"
                                :loading="libri_store.loading_eliminazione">Elimina</n-button>
                        </n-space>
                    </div>
                </div>
            </n-spin>
        </section>
    </div>
    <ModaleConferma v-model:show="mostra_modale_conferma" titolo="Elimina Libro"
        :messaggio="'Sei sicuro di voler eliminare il libro \'\'' + libro?.titolo + '\'\'? Questa operazione è irreversibile. Assicurati di aver chiuso tutte le condivisioni.'"
        testoConferma="Elimina Definitivamente" tipo="warning" @conferma="deleteLibro(libro_id)" />
</template>

<script setup>
import { troncaStringa } from '@/utils/toolkit'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useLibriStore } from '@/stores/libriStore'
import { useScaffaliStore } from '@/stores/scaffaliStore'
import { useUtentiStore } from '@/stores/utentiStore'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import ModaleConferma from '@/components/ModaleConferma.vue'


const image_url = import.meta.env.VITE_ROOT_URL // url base per le immagini da file .env

const scaffali_store = useScaffaliStore()
const libri_store = useLibriStore()
const utenti_store = useUtentiStore()

const message = useMessage()
const route = useRoute()
const router = useRouter()
const libro = ref(null)
const mostra_modale_conferma = ref(false)
const libro_id = route.params.id // recupero ID se presente (modalità modifica)
const copertina_default = '/placeholder_libro.jpg' //palceholder della copertina di default


const form_ref = ref(null)
const lista_files = ref([])
const file = ref(null)
const is_disabilitato = ref(true)
const anteprima = ref(null)
const loading_libro = ref(true)

//stato del Form, inizializzato per funzionalità nuovo libro
const form = ref({
    titolo: '',
    autore: '',
    anno: '',
    descrizione: '',
    scaffale_id: '',
    genere_id: '',
    tipo_condivisione_id: '',
    copertina_thumb: '',
    data_ultima_modifica: ''
})

// regole di validazione per campi obbligatori
const rules = {
    titolo: { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
    anno: [
        { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
        { pattern: /^\d{4}$/, message: 'Inserisci un anno valido (es. 2024)', trigger: 'blur' }
    ],
    scaffale_id: { type: 'number', required: true, message: 'Seleziona uno scaffale', trigger: 'change' },
    genere_id: { type: 'number', required: true, message: 'Seleziona un genere', trigger: 'change' },
    tipo_condivisione_id: { type: 'number', required: true, message: 'Seleziona il tipo', trigger: 'change' },
}


//computed dedicato alla scelta di cosa visualizzare nel riquadro della copertina
const copertina_src = computed(() => {
    // mostra anteprima locale se utente ha appena caricato immagine
    if (anteprima.value) {
        return anteprima.value
    }
    // altrimenti mostra copertina dal server se esiste (placeholder come fallback)
    return form.value?.copertina
        ? `${image_url}/${form.value.copertina}`
        : copertina_default
})

const lista_generi = computed(() => {
    //recupero la lista dei generi letterari dallo store
    const generi_letterari = libri_store.generi_letterari || []
    //trasformo l'array appena resrituito nel formato {label, value}
    return generi_letterari.map(g => ({
        label: g.dettagli,
        value: g.id
    }))
})

const lista_tipi_condivisione = computed(() => {
    //recupero la lista dei generi letterari dallo store
    const tipi_condivisione = libri_store.tipi_condivisione || []
    //trasformo l'array appena resrituito nel formato {label, value}  
    return tipi_condivisione.map(t => ({
        label: t.dettagli,
        value: t.id
    }))
})

//lista che permette di scegliere dove inserire il nuovo libro o dove spostare quello esistente
const lista_scaffali_disponibili = computed(() => {
    const miei_scaffali = scaffali_store.scaffali_utente || []
    
    //trasformo l'array appena resrituito nel formato {label, value}
    return miei_scaffali.map(s => ({
        label: s.nome,
        value: s.id
    }))
})

const titolo_pagina = computed(() => {
    // controllo proprietà del libro
    const is_proprietario = libri_store.sono_proprietario_libro
    const id_presente = !!libro_id

    if (id_presente) {
        if (is_proprietario) {
            return 'Modifica Libro'
        } else {
            return 'Dettagli Libro'
        }
    }
    return 'Aggiungi Nuovo Libro'
})


async function inizializzaPagina() {
    pulisciStatoFile() //resetta variabili upload
    await caricaDatiLibro()
}

async function caricaDatiLibro() {
    libro.value = null
    if (libro_id) {
        try {
            const risposta_libro = await libri_store.getLibroByID(libro_id)
            libro.value = libri_store.libro_selezionato_dettagli
            //console.log(libro.value)

            form.value = {
                ...libro.value,
                anno: String(libro.value.anno)
            }
            is_disabilitato.value = !libri_store.sono_proprietario_libro // disabilito form se utente non proprietario
        } catch (err) {
            message.error(err.message || 'Errore nel caricamento del libro')
            router.push({ name: 'Libreria' }) // redirect alla propria libreria in caso di errore
        }
    } else {
        is_disabilitato.value = false
    }
    // chiamate parallele per dati menu a tendine del form
    await Promise.all([
        libri_store.getGeneriLetterari(),
        libri_store.getTipiCondivisione(),
        scaffali_store.getMieiScaffali()
    ])
    loading_libro.value = false  
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

// controllo che l'immagine caricata  non sia troppo grande e che sia davvero un'immagine
function controlloPreUpload({ file }) {

    const dimensione_massima = 5 * 1024 * 1024 // 5 MB
    const file_nativo = file.file

    //controllo del tipo MIME
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

// configuro come voglio visualizzare la data (stile italiano gg/mm/aaaa)
const opzioni = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Forzare il formato 24 ore
}

// trasformo la data nel formato italiano
const data_formattata = computed(() => {
    const data_str = form.value?.data_ultima_modifica

    // controllo se il valore è presente (dovrebbe essere una stringa ISO)
    if (data_str) {
        const data_obj = new Date(data_str)
        // uso opzioni già definite, 'it-IT' per l'ordine gg/mm/aaaa
        return data_obj.toLocaleString('it-IT', opzioni)
    }
    return 'Non disponibile'
})

// gestisco il file quando viene selezionato e creo l'anteprima
function gestisciCaricamentoFile(upload) {
    //console.log("gestisciCaricamentoFile chiamata con parametro", upload)
    if (upload.length > 1) {
        // Se l'utente ha aggiunto più file forzo la lista a prendere solo l'ultimo.
        upload = [upload[upload.length - 1]]
    }
    lista_files.value = upload
    const f = lista_files.value[0]?.file
    //console.log("gestisciCaricamentoFile chiamata -> f", lista_files.value[0]?.file)
    if (!f) {
        file.value = null
        anteprima.value = null
        //console.log("Nessun File")
        return
    }
    //console.log("File caricato", f)
    file.value = f
    anteprima.value = URL.createObjectURL(f) // URL temporaneo
    //console.log("anteprima Value:", anteprima.value)
}

async function inviaDati() {
    try {
        //validazione dati form, se fallisce salta direttamente al catch
        await form_ref.value?.validate()

        const fd = new FormData() // FormData perché c'è un file (la copertina) da inviare

        for (const key in form.value) {
            //forzo l'anno a stringa se è un numero per evitare il warning di Naive UI
            const valore = (key === 'anno') ? String(form.value[key]) : form.value[key]
            if (valore === null || valore === undefined) {
                continue // non aggiungo campo al FormData
            }
            if (key === 'descrizione') {
                fd.append(key, String(troncaStringa(valore, 500) ?? ''))
            } else {
                fd.append(key, String(valore ?? ''))
            }
        }

        //verifico la presenza del file di copertina ed eventualmente lo aggiungo al FormData
        if (file.value instanceof File) {
            //console.log("file.value è istanza di File")
            fd.append('type', 'copertina')
            fd.append('file', file.value)
        }
        
        let risposta
        if (libro_id) {
            //modalità modifica libro
            risposta = await libri_store.updateLibro(libro_id, fd)
            //Aggiorna il form con i nuovi dati
            if (risposta && risposta.data) {
                form.value = { ...form.value, // prendo i dati attuali del form
                    ...libri_store.libro_selezionato_dettagli,  //li sovrascrivo con quelli nuovi
                    anno: String(libri_store.libro_selezionato_dettagli.anno)
                    }
            }

            message.success(`Libro "${form.value.titolo}" aggiornato!`)
        } else {
            //modalità creazione libro
            risposta = await libri_store.createLibro(fd)
            message.success(`Libro "${libri_store.libro_selezionato_dettagli.titolo}" creato con successo!`)
            router.back()
        }
    } catch (err) {
        message.error(err.message || 'Errore durante il salvataggio')
    } finally {
        pulisciStatoFile() // resetta input file dopo invio
    }

}

function richiediCondivisione(id){
    router.push({ name: 'RichiestaCondivisione', params: { id }})
}

async function deleteLibro() {
    try {
        await libri_store.deleteLibro(libro_id)
        router.back()
        message.success("Libro eliminato correttamente")
    } catch (err) {
        message.error(err.message || "Errore durante l'eliminazione")
        console.error(err)
    } finally {
        mostra_modale_conferma.value = false
    }
}

watch(() => route.fullPath, () => {
    inizializzaPagina()
})

onMounted(async () => {
    inizializzaPagina()
})

// rilascia della memoria anteprima quando componente distrutto
onBeforeUnmount(() => {
    if (anteprima.value) {
        URL.revokeObjectURL(anteprima.value)
    }
})
</script>

<style scoped>

/* statistiche visualizzazioni */
.statistiche_visualizzazioni {
    font-weight: bold;
    margin-left: 0.5rem;
    color: var(--btn-primary-color);
}

.visualizzazioni_container {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1rem;
    margin: 1rem 0;
    color: var(--color-text-dark);
}



</style>
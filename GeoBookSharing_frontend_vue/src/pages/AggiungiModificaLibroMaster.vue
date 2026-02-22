<template>
    <div class="page">
        <section>
            <n-spin :show="libri_master_store.loading">
                <div v-show="form.titolo || !libri_master_store.loading">
                    <div class="intestazione">
                        <h1>{{ titolo_pagina || 'TITOLO'}}</h1>
                    </div>
                    <div class="contenuto_modulo">
                        <n-card class="scheda_libro" title="Dettagli Libro Master" :bordered="true">
                            <n-form :model="form" :rules="rules" ref="form_ref" label-placement="top"
                                :disabled="!is_admin">
                                <n-form-item class="sezione_copertina_avatar" label="Copertina">
                                    <div class="avatar_copertina_container">
                                        <n-avatar :src="copertina_src" round size="large" class="avatar_copertina_img" />
                                        <!--:default-upload="false" perché non voglio che il file venga inviato al back-end appena selezionato
                                        ma solo quando l'utente invia il form-->
                                        <n-upload @before-upload="controlloPreUpload" :default-upload="false"
                                            accept="image/*" :max-count="1" v-model:file-list="lista_files"
                                            @update:file-list="gestisciCaricamentoFile">

                                            <n-button v-if="utenti_store.utente.ruolo === 'admin'" round ghost type="info"
                                                size="small">
                                                Carica nuova copertina
                                            </n-button>
                                        </n-upload>
                                    </div>
                                </n-form-item>
                                <n-form-item label="ISBN" path="isbn">
                                    <n-input round v-model:value="form.isbn" />
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
                                <n-form-item label="Genere" path="genere_id">
                                    <n-select round v-model:value="form.genere_id" :options="lista_generi"
                                        placeholder="Genere Letterario" />
                                </n-form-item>
                                <n-form-item v-if="id_presente" label="Scaffale"
                                    path="scaffale_id">
                                    <n-select round v-model:value="form.scaffale_id"
                                        :options="lista_scaffali_disponibili" :disabled="false" placeholder="Seleziona lo scaffale" />
                                </n-form-item>
                                
                                <n-divider />
                                <div>
                                    <p>Ultima modifica: {{ data_formattata }}</p>
                                </div>
                            </n-form>
                        </n-card>                        
                    </div>
                    <n-divider />
                    <n-space justify="end">
                        <n-button type="info"
                            primary 
                            ghost
                            @click="router.back()">
                            Indietro
                        </n-button>

                        <n-button 
                            v-if="is_admin"
                            type="primary"
                            ghost
                            attr-type="submit"
                            :loading="libri_master_store.loading"
                            @click="inviaDati"
                        >
                        {{ testo_salvataggio }}
                        </n-button>

                        <n-button
                            v-if="id_presente" 
                            type="warning"
                            :loading="scaffali_store.loading"
                            @click="aggiungiAScaffale"
                        >
                        Aggiungi al tuo Scaffale
                        </n-button>
                        <n-button
                            v-if="id_presente && is_admin" 
                            type="error"
                            :loading="scaffali_store.loading"
                            @click="deleteLibroMaster(libro_master_id)"
                        >
                        Elimina
                        </n-button>
                    </n-space>
                </div>
            </n-spin>
        </section>
    </div>
    <ModaleConferma v-model:show="mostra_modale_conferma" titolo="Elimina Libro"
        :messaggio="'Sei sicuro di voler eliminare il libro \'\'' + libro_master?.titolo + '\'\'? Questa operazione è irreversibile. Assicurati di aver chiuso tutte le condivisioni.'"
        testoConferma="Elimina Definitivamente" tipo="warning" @conferma="deleteLibro(libro_master_id)" />
</template>

<script setup>
    
    import { troncaStringa } from '@/utils/toolkit'
    import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useLibriMasterStore } from '@/stores/libriMasterStore'
    import { useLibriStore } from '@/stores/libriStore'
    import { useScaffaliStore } from '@/stores/scaffaliStore'
    import { useUtentiStore } from '@/stores/utentiStore'
    import { useRoute, useRouter } from 'vue-router'
    import { useMessage } from 'naive-ui'
    import ModaleConferma from '@/components/ModaleConferma.vue'

    // configurazione percorsi immagini
    const image_url = import.meta.env.VITE_ROOT_URL
    const copertina_default = '../placeholder_libro.jpg'

    // inizializzazione store e router
    const utenti_store = useUtentiStore()
    const libri_master_store = useLibriMasterStore()
    const router = useRouter()
    const route = useRoute()
    const scaffali_store = useScaffaliStore()
    const message = useMessage()
    const libri_store = useLibriStore()

    //stati
    const libro_master_id = Number(route.params.id) // recupero ID se presente (modalità modifica)
    const form_ref = ref(null)
    const anteprima = ref(null)
    const lista_files = ref([])
    const file = ref(null)
    const libro_master = ref(null)
    const mostra_modale_conferma = ref(false)

    const is_admin = utenti_store.utente?.ruolo === 'admin'
    const id_presente = !!libro_master_id

    // struttura del form
    const form = ref({
        isbn: '',
        titolo: '',
        autore: '',
        anno: '',
        descrizione: '',
        scaffale_id: '',
        genere_id: '',
        data_ultima_modifica: '',
        copertina: '',
        copertina_thumb: ''
    })

// regole di validazione di input (blur fa si che la validazione scatti quando l’utente esce dal campo )
const rules = {
    isbn: { required: true, message: 'ISBN obbligatorio', trigger: 'blur' },
    titolo: { required: true, message: 'Titolo obbligatorio', trigger: 'blur' },
    autore: { required: true, message: 'Autore obbligatorio', trigger: 'blur' },
    anno: [
        { required: true, message: 'Campo obbligatorio', trigger: 'blur' },
        // cifra numerica di esattamente 4 cifre
        { pattern: /^\d{4}$/, message: 'Inserisci un anno valido (es. 2025)', trigger: 'blur' }
    ],
    genere_id: { type: 'number', required: true, message: 'Seleziona un genere', trigger: 'change' },
}


//computed dedicato alla scelta di cosa visualizzare nel riquadro della copertina
const copertina_src = computed(() => {
    // mostra anteprima locale se utente ha appena caricato foto
    if (anteprima.value) {
        return anteprima.value
    }
    // altrimenti mostra copertina dal server se esiste (placeholder come fallback)
    return form.value?.copertina
        ? `${image_url}/${form.value.copertina}`
        : copertina_default
})

//elenco dei generi letterari per select di naive
const lista_generi = computed(() => {
    //recupero la lista dei generi letterari dallo store
    const generi_letterari = libri_store.generi_letterari || []
    //trasformo l'array appena resrituito nel formato {label, value}
    return generi_letterari.map(g => ({
        label: g.dettagli,
        value: g.id
    }))
})

//lista che permette di scegliere dove inserire il nuovo libro o dove spostare quello esistente
const lista_scaffali_disponibili = computed(() => {
    //recupero la lista degli scaffali dallo store
    const miei_scaffali = scaffali_store.scaffali_utente || []
    
    //trasformo l'array appena resrituito nel formato {label, value}
    return miei_scaffali.map(s => ({
        label: s.nome,
        value: s.id
    }))
})

//titolo pagina dinamico in base alla modalità creazione/modifica. solo admin può modificare un libro master
const titolo_pagina = computed(() => {    
    if (id_presente) {
        if (is_admin) {
            return 'Modifica Libro'
        } else {
            return 'Dettagli Libro'
        }
    }
    return 'Aggiungi Nuovo Libro'
})


//inizializzaazione pagina
async function inizializzaPagina() {
    pulisciStatoFile() //resetta variabili upload
    await caricaDatiLibro()//carica info libro
}


//testo dinamico del pulsante di invio
const testo_salvataggio = computed( ()=> {
  if (id_presente) {
    return 'Salva Modifiche'
  } else {
    return 'Crea Master'
  }

})


//caricamento dati del libro master
async function caricaDatiLibro() {
    libro_master.value = null
    if (libro_master_id) {
        try {
            const risposta_libro_master = await libri_master_store.getLibroMasterByID(libro_master_id)
            libro_master.value = risposta_libro_master.data
            //console.log(libro_master.value)

            form.value = {
                ...libro_master.value,
                anno: String(libro_master.value.anno)
            }

        } catch (err) {
            message.error(err.message || 'Errore nel caricamento del libro master')
        }
    } 
    // chiamate parallele per dati menu a tendine del form
    await Promise.all([
        libri_store.getGeneriLetterari(),
        scaffali_store.getMieiScaffali()
    ])
}

// reset variabili upload
function pulisciStatoFile() {
    file.value = null
    if (anteprima.value) {
        // revoca url blob per evitare memory leak
        URL.revokeObjectURL(anteprima.value)
        anteprima.value = null
    }
    lista_files.value = []
}

// controllo pre-upload che sia un'immagine e non sia troppo grande max 5MB 
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

    return true // Solo se valido
}

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


// Configuro come voglio visualizzare la data (stile italiano gg/mm/aaaa)
const opzioni = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Forzare il formato 24 ore
}

// Trasformo la data nel formato italiano
const data_formattata = computed(() => {
    const data_str = form.value.data_aggiornamento

    // Controlla se il valore è presente (dovrebbe essere una stringa ISO)
    if (data_str) {
        const data_obj = new Date(data_str)
        // Usa le opzioni già definite, 'it-IT' per l'ordine gg/mm/aaaa
        return data_obj.toLocaleString('it-IT', opzioni)
    }
    return 'Non disponibile'
})

// invio dati form - create o update
async function inviaDati() {
    //Validazione, se fallisce salta direttamente al catch
    await form_ref.value?.validate()
    const fd = new FormData // Uso FormData perché c'è un file (la copertina) da inviare

    for (const key in form.value) {
        //console.log(key)
        //forzo l'anno a stringa se è un numero per evitare il warning di Naive UI
        const valore = (key === 'anno') ? String(form.value[key]) : form.value[key]
        if (key === 'scaffale_id' && (valore === null || valore === '')) {
            continue
        }
        if (key === 'descrizione') {
            fd.append(key, String(troncaStringa(valore, 500) ?? ''))
        } else {
            fd.append(key, String(valore ?? ''))
        }
    }

    //verifico la presenza del file di copertina ed eventualmente lo aggiungo
    if (file.value instanceof File) {
        fd.append('type', 'copertina')
        fd.append('file', file.value)
    }

     try {
        let risposta
        if (id_presente) {
            //Modalità modifica
            risposta = await libri_master_store.updateLibroMaster(libro_master_id, fd)
            //Aggiorna il form con i nuovi dati
            // inclusi i nuovi percorsi copertina/copertina_thumb
            if (risposta && risposta.data) {
                form.value = { ...form.value, // Prendo i dati attuali del form
                    ...risposta.data, //li sovrascrivo con quelli nuovi del server
                    anno: String(risposta.data.anno) //FORZO l'anno a stringa per Naive UI
                    }
            }
            message.success(`Libro Master "${form.value.titolo}" aggiornato!`)

        } else {
            //Modalità creazione
            risposta = await libri_master_store.createLibroMaster(fd)
            message.success(`Libro Master "${risposta.data.titolo}" creato con successo!`)
            //reindirizzamento al dettaglio del libro
            router.back()            
        }
        
    } catch (err) {
        router.push({name: 'CatalogoLibriMaster'})
        //console.log(err)
        message.error(err.message || 'Errore durante il salvataggio')
    } finally {
        pulisciStatoFile() // resetta input file dopo invio
    }
}

// copia del libro master nello scaffale utente
async function aggiungiAScaffale() {
     //console.log("Aggiungo a Scaffale")
    //console.log(form.value)
    // VALIDAZIONE: Controlla che uno scaffale sia stato selezionato
    if (!form.value.scaffale_id) {
        message.error('Devi selezionare uno scaffale a cui aggiungere il libro.')
        return
    }
    //Preparazione dei dati
    const data = {
        master_id: libro_master_id,
        scaffale_id:  form.value.scaffale_id,
    }
  
    //Esecuzione dell'azione e gestione UI
    try {
        const nuovo_libro = await libri_store.createLibroDaMaster(data)
        
        //Feedback di successo
        message.success(`${nuovo_libro.message}`)
        
        //Reindirizzamento o aggiornamento locale
        router.push({
                      name: 'DettaglioScaffale',
                      params: { id: form.value.scaffale_id }
                  }) // Porta l'utente alla sua libreria
        
    } catch (err) {
        message.error(`Aggiunta fallita: ${err.message || 'Errore di rete'}`)
        
    }
}

// eliminazione definitiva libro master da catalogo
async function deleteLibroMaster() {
    try {
        await libri_master_store.deleteLibroMaster(libro_master_id)
        router.back()
        message.success("Libro Master eliminato correttamente")
    } catch (err) {
        message.error(err.message || "Errore durante l'eliminazione")
        console.error(err)
    } finally {
        mostra_modale_conferma.value = false
    }
}

// ricarica dati ad ogni cambio rotta (es passaggio da un libro all'altro)
watch(() => route.fullPath, () => {
    inizializzaPagina()
})

onMounted(async () => {
    inizializzaPagina()
})

// pulizia della memoria quando componente distrutto
onBeforeUnmount(() => {
    if (anteprima.value) {
        URL.revokeObjectURL(anteprima.value)
    }
})
</script>


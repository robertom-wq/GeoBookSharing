<template>
    <!--contenitore principale della pagina-->
    <div class="page">
        <!-- intestazione della pagina con titolo e sottotitolo -->
        <div class="intestazione">
            <h1>Richiedi Condivisione</h1>
            <p class="sottotitolo">Compila in form e richiedi il libro scelto</p>
        </div>
          <!--contenitore del contenuto principale-->
        <div class="contenuto_modulo">
        <!-- spinner di caricamento durante il recupero di libri o condivisioni -->
        <n-spin :show="libri_store.loading || condivisioni_store.loading">
            <!-- card contenente modulo di richiesta -->
            <n-card class="scheda_richiesta">
                <!-- avviso mostrato se il libro non esiste-->                
                <n-alert v-if="!libri_store.loading && !libro" title="Non Disponibile" type="error" class="avviso_disponibilita">
                    Siamo spiacenti, questo libro non esiste o non è stato trovato.
                </n-alert>
                 <!-- form per invio della richiesta di condivisione -->
                <n-form v-else
                    ref="form_ref"
                    :model="form"
                    :rules="rules"
                    label-placement="top"
                    @submit.prevent="inviaDati"
                >
                    <!-- campo con il nome del proprietario del libro -->
                    <n-form-item label="Proprietario" v-if="libro">
                        <n-input :value="libro.proprietario?.username || 'Sconosciuto'" disabled />
                    </n-form-item>
                    <!-- campo con il titolodel libro -->
                    <n-form-item label="Libro" v-if="libro">
                        <n-input :value="libro?.titolo || 'Sconosciuto'" disabled />
                    </n-form-item>

                    <n-divider />
                     <!-- selezione del tipo di condivisione richiesto (se già impostato nella scheda del libro non sarà compilabile) -->
                    <n-form-item label="Tipo di Condivisione" path="tipo_condivisione_id">
                        <n-select
                            v-model:value="form.tipo_condivisione_id"
                            :options="lista_tipi_condivisione"
                            :disabled="is_tipo_condifisione_impostato"
                            placeholder="Seleziona il tipo di condivisione richiesto"
                        />
                    </n-form-item>
                    <!-- avviso della necessità di specificare delle date -->
                    <n-alert title="Specificare le Date" type="info" class="avviso_date">
                        Seleziona l'intervallo di date per la condivisione e quindi premi "Conferma".
                    </n-alert>
                    <!-- selettore intervallo date per periodo di condivisione -->
                    <n-form-item label="Periodo Richiesto" path="range_date">
                        <n-date-picker
                            v-model:value="range_date"
                            type="daterange"
                            class="selettore_date"
                            :is-date-disabled="isDateDisabilitate"
                            :clearable="false"
                        />
                    </n-form-item>
                    <!--opzionale per note aggiuntive al proprietario -->
                    <n-form-item label="Note per il Proprietario (Opzionale)" path="note">
                        <n-input
                            v-model:value="form.note"
                            type="textarea"
                            placeholder="Ad esempio: 'Vorrei leggerlo la prossima settimana.'"
                            :maxlength="500"
                        />
                    </n-form-item>

                    <n-divider />
                    <!--pulsanti azioni del form -->
                    <n-space justify="end">
                        <!-- invio della richiesta -->
                        <n-button 
                            type="primary" 
                            attr-type="submit"
                            :loading="condivisioni_store.loading"
                            :disabled="!libro"
                            ghost
                        >
                            Invia Richiesta
                        </n-button>
                        <!--annullamento e ritorno alla pagina precedente -->
                        <n-button @click="router.back()" 
                            type="warning"
                            >Annulla</n-button>
                    </n-space>
                </n-form>
            </n-card>
        </n-spin>
        </div>
    </div>
</template>

<script setup>
import { useCondivisioniStore } from '@/stores/condivisioniStore.js'
import { useLibriStore } from '@/stores/libriStore.js'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { ref, onMounted, computed, watch } from 'vue'

const condivisioni_store = useCondivisioniStore()
const libri_store = useLibriStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()

//store
const form_ref = ref(null)
const range_date = ref(null) //il range di date dal al è memorizzato in un array di timestamp
const libro_id = route.params.id
const oggi = new Date().setHours(0, 0, 0, 0); //riferimento per il calcolo delle date passate oggi alle 00:00

const form = ref({
    libro_id: Number(libro_id) || null,
    tipo_condivisione_id: null,
    data_dal: null,
    data_al: null,
    note: ''
})

//regole di validazione per i campi del form
const rules = {
    tipo_condivisione_id: {
        required: true,
        type: 'number',
        message: 'Il tipo di condivisione è obbligatorio',
        trigger: ['blur', 'change']
    }
}

// recupero dettagli del libro selezionato
const libro = computed(() => {
    return libri_store.libro_selezionato_dettagli
})

const lista_tipi_condivisione = computed(() => {
    //recupero la lista dei tipi di condivisione dallo store
    const tipi_condivisione = libri_store.tipi_condivisione || []

    //trasformo l'array appena resrituito nel formato {label, value} per compatibilità con select 
    return tipi_condivisione.map(t => ({
        label: t.dettagli,
        value: t.id
    }))
})


const tipo_condivisione_selezionato = computed(()=>{
    return lista_tipi_condivisione.value.find(t =>
    t.value === form.value.tipo_condivisione_id)
})

//Se non è stato impostato dal proprietario alcun tipo di cpndivisione
//il richiedente può proporne uno e modificare il form. Nel caso ci sia invece
//un tipo già selezionato dal proprietatario che non sia "non definito" allora
// è immutabile
const is_tipo_condifisione_impostato = computed(()=>{
    return !!tipo_condivisione_selezionato.value && tipo_condivisione_selezionato.value !== 'Non definito'
}) 

function isDateDisabilitate(timestamp) {
    //disabilito tutte le date antecedenti a oggi
    return timestamp < oggi
}

// watch per la conversione dei timestamp in stringhe iso
watch(range_date, (newRange) => {
    //verifico che il nuovo range esista e che abbia entrambi gli elementi
    if (newRange && newRange.length === 2) {
        // [data_dal, data_al] sono timestamp, li converto in oggetti Date per il form
        form.value.data_dal = new Date(newRange[0]).toISOString().split('T')[0];
        form.value.data_al = new Date(newRange[1]).toISOString().split('T')[0];
    } else {
        //reset dei campi data
        form.value.data_dal = null;
        form.value.data_al = null;
    }
})

//invio richiesta al backend
async function inviaDati() {
    form_ref.value?.validate()
    
    try {
        const data = {
            libro_id: form.value.libro_id,
            tipo_condivisione_id: form.value.tipo_condivisione_id,
            data_dal: form.value.data_dal,
            data_al: form.value.data_al,
            note: form.value.note
        }
        //chiamata della funzione di creazione nello store
        const nuova_condivisione = await condivisioni_store.createRichiestaCondivisione(data)
        message.success("Richiesta di condivisione inviata con successo")
        //reindirizzamento alla pagina delle condivisioni dopo esito positivo
        router.push({ name: 'Condivisioni'})
        
    } catch (err) {
        message.error(err.message || "Impossibile inviare i dati" )
        console.error("Impossibile inviare i dati")
    }
}

onMounted(async ()=>{
    // visto che non necessitano di sequenzialità eseguo le due chiamate in cntemporanea
    await Promise.all([
        libri_store.getLibroByID(libro_id),
        libri_store.getTipiCondivisione()
    ])
    //console.log(libri_store.tipi_condivisione)
})

</script>

<style scoped>


/*spaziature avvisi */
.avviso_disponibilita {
    margin-bottom: 1.25rem; 
}

.avviso_date {
    margin-bottom: 1rem; /* 15px */
}

.selettore_date {
    width: 100%; /*estensione larghezza del selettore date */
}

.n-button {
    min-width: 8rem;
}

:global(.n-date-panel) {
    display: flex!important;
    flex-direction: column!important;
}


</style>
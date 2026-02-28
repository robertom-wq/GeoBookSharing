<template>
    <div class="page">
        <section>
            <n-spin :show="scaffali_store.loading">
                <div v-show="scaffale || !scaffali_store.loading">
                    <div class="intestazione">
                        <h1>{{ is_modifica ? 'Modifica' : 'Nuovo' }} Scaffale</h1>
                        <p class="sottotitolo">Ciao {{ utenti_store.utente?.nome.toUpperCase() }}. <br>
                            Gestisci la tua libreria aggiungendo o modificando i tuoi scaffali.
                        </p>
                    </div>
                    <div class="contenuto_modulo">
                        <n-card class="scheda_nuovo_scaffale">
                            <n-form ref="form_ref" :model="form" :rules="rules" label-placement="top"
                                :validate-on-rule-change="false" @submit.prevent="gestisciSalvataggioScaffale">
                                <n-form-item label="Nome" path="nome">
                                    <n-input v-model:value="form.nome" />
                                </n-form-item>
                                <n-form-item label="Descrizione" path="descrizione">
                                    <n-input v-model:value="form.descrizione" type="textarea" :autosize="{
                                        minRows: 3,
                                        maxRows: 6
                                    }" />
                                </n-form-item>
                                <n-form-item label="Posizione (seleziona sulla mappa)">
                                    <div class="contenitore_mappa" v-if="!is_salvataggio_in_corso">
                                        <!--@update:coords permette al componente figlio Mappa di comunicare le coordinate al form
                                         del componente padre in modo che i dati lat e lng siano sincronizzati con la posizione del marker
                                         spostata dall'utente sulla mappa-->
                                        <Mappa @update:coords="gestisciAggiornamentoCoordinate" ref="mappa_ref"
                                            :centra_mappa="scaffale ? { lat: form.lat, lng: form.lng } : { lat: 45.4642, lng: 12.1900 }"
                                            :dati_scaffali="scaffale ? [scaffale] : []" />
                                    </div>
                                    <n-grid x-gap="12" :cols="2" class="griglia_coordinate_nascosta">
                                        <n-gi>
                                            <n-input-group>
                                                <n-input-group-label>
                                                    Lat
                                                </n-input-group-label>
                                                <n-input :value="String(form.lat)" :readonly="true" />
                                            </n-input-group>
                                        </n-gi>
                                        <n-gi>
                                            <n-input-group>
                                                <n-input-group-label>
                                                    Lng
                                                </n-input-group-label>
                                                <n-input :value="String(form.lng)" :readonly="true" />
                                            </n-input-group>
                                        </n-gi>
                                    </n-grid>
                                </n-form-item>
                                <n-divider />
                                <div class="pulsanti_azione">
                                    <n-button type="primary" attr-type="submit" :loading="scaffali_store.loading">
                                        {{ is_modifica ? 'Salva Modifiche' : 'Aggiungi Scaffale' }}
                                    </n-button>
                                </div>
                            </n-form>
                        </n-card>

                    </div>
                </div>
            </n-spin>
        </section>
    </div>

</template>

<script setup>
import { useUtentiStore } from '@/stores/utentiStore'
import { useScaffaliStore } from '@/stores/scaffaliStore'
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import Mappa from '@/components/Mappa.vue'


const router = useRouter()
const route = useRoute()
const message = useMessage()
const utenti_store = useUtentiStore()
const scaffali_store = useScaffaliStore()

//Se l'ID esiste, la pagina si comporta come editor, altrimenti come creatore.
const is_modifica = computed(() => !!route.params.id)

// stati
const scaffale = ref(null)
const form_ref = ref(null)
const mappa_ref = ref(null)
const is_salvataggio_in_corso = ref(false)

// modello
const form = ref({
    nome: '',
    descrizione: '',
    lat: 45.4642,
    lng: 12.1900
})

// regole validazione form naive
const rules = {
    nome: { required: true, message: 'Inserisci un nome', trigger: 'blur' },
    descrizione: { required: true, message: 'Inserisci una descrizione', trigger: 'blur' },
}

//verifico proprietà dello scaffale
const is_utente_proprietario = computed(() => {
    //mi assicuro che i dati siano caricati
    if (!scaffale.value || !utenti_store.utente) {
        return false
    }
    // confronto id proprietario scaffale con utente loggato
    return scaffale.value.data.utente.id === utenti_store.utente.id
})

// funzione unica che gestisce il salvataggio delle impostazioni,
// in base a is_modifica scelgo se creare nuovo elemento o modificare uno esistente
async function gestisciSalvataggioScaffale() {
    //console.log('SALVATAGGIo')
    await form_ref.value?.validate()

    try {
        // Controllo sicurezza: assicura che lat e lng non siano nulli
        if (form.value.lat === null || form.value.lng === null) {
            message.error('Seleziona una posizione sulla mappa prima di salvare')
            return
        }
        is_salvataggio_in_corso.value = true
        await nextTick()
        //invio dati allo store
        if (is_modifica.value) {
            //console.log("Inviando aggiornamento per ID:", route.params.id)
            await scaffali_store.updateScaffale(route.params.id, form.value)
            message.success("Scaffale aggiornato con successo!")
        } else {
            //console.log("Creando nuovo scaffale")
            await scaffali_store.createScaffale(form.value)
            message.success("Nuovo scaffale creato!")
        }
        //redirect alla libreira
        router.push({ name: 'Libreria' })

    } catch (err) {
        console.error("Impossibile completare il salvataggio:", err)
        message.error(err.message || 'Errore durante il salvataggio')
    }
}

function gestisciAggiornamentoCoordinate(coordinate) {
    form.value.lat = coordinate.lat
    form.value.lng = coordinate.lng
}


onMounted(async () => {
    //ottengo l'id dal parametro nell'URL
    const scaffale_id = route.params.id
    if (is_modifica.value) {
        // sono in modalità modifica
        if (isNaN(scaffale_id)) {
            // id non numerico
            message.error('Id non valido. Ritorno alla libreria...')
            router.push({ name: 'Libreria' })
            return
        }

        //recupero dati dal db
        try {
            const scaffale_recuperato = await scaffali_store.getScaffaleById(scaffale_id)
            if (!scaffale_recuperato) {
                // scaffale non trovato
                message.error('Scaffale inesistente o eliminato')
                router.push({ name: 'Libreria' })
                return
            }
            scaffale.value = scaffali_store.scaffale_selezionato

            // controllo proprieta
            if (!is_utente_proprietario.value) {
                // permesso negato
                message.error('Non hai i permessi per modificare questo scaffale')
                router.push({ name: 'Libreria' })
                return
            }
            // riempio il form con i dati ricevuti
            form.value = {
                nome: scaffale.value.data.nome,
                descrizione: scaffale.value.data.descrizione,
                lat: scaffale.value.lat,
                lng: scaffale.value.lng
            }

            //forzo aggiornamento mappa tramite funzione esposta su Mappa.vue
            if (mappa_ref && typeof mappa_ref.value.aggiornaMappaEMarkers === 'function') {
                //console.log('funzione trovata')
                mappa_ref.value.aggiornaMappaEMarkers(form.value.lat, form.value.lng, 15)
            }


        } catch (err) {
            console.error("Errore nel caricamento dello scaffale", err)
            scaffale.value = null
        }

    } else {
        // modalita nuovo inserimento
        form.value = { nome: '', descrizione: '', lat: 45.4642, lng: 12.1900 } // reset form ai valori default
    }

})



</script>

<style scoped>

/* scheda del Form */
.scheda_nuovo_scaffale {
    max-width: 50rem; 
    margin: 0 auto;
    background-color: var(--pearl-white-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

.contenitore_mappa {
    width: 100%; 
    height: clamp(25.75rem, 35vh, 31.25rem);
    border-radius: var(--border-radius);
    overflow: hidden;
    border: 0.0625rem solid #eee;
    margin-top: 0.5rem;
}

/* la mappa occupa tutto il suo contenitore */
.contenitore_mappa :deep(.sezione_mappa_inner) {
    height: 100% !important;
    display: flex;
    flex-direction: column;
}

.contenitore_mappa :deep(.mappa_container) {
    height: auto !important; 
    flex-grow: 1 !important;
    min-height: 0 !important;
    display: flex;
    flex-direction: column;
}

/* Griglia coordinate nascosta*/
.griglia_coordinate_nascosta {
    display: none !important;
}

.pulsanti_azione {
    padding-bottom: 2rem; 
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .scheda_nuovo_scaffale {
        padding: 0.5rem; /* riduce padding interno su schermi piccoli */
    }
}
</style>
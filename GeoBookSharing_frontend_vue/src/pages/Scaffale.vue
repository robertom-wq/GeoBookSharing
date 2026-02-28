<template>
    <div class="page">
        <section>
            <n-spin :show="scaffali_store.loading || !scaffale">
                <!-- contenuto visibile solo quando lo scaffale è caricato -->
                <div v-if="scaffale">
                    <div class="intestazione">
                        <h1>{{ scaffale.data.nome }}</h1>
                        <p class="sottotitolo">{{ scaffale.data.descrizione }}</p>
                    </div>
                    <div class="contenuto_scaffale">
                        <template v-if="scaffale">

                            <div class="contenitore_mappa" v-if="!is_cancellazione_in_corso">
                                <Mappa :centra_mappa="{ lat: scaffale.lat, lng: scaffale.lng }"
                                        :dati_scaffali="[scaffale]" :is_home_scaffali="true" />
                            </div>
                            <n-divider />
                            <n-h3>Libri contenuti</n-h3>
                            <!-- stato vuoto se nessun libro presente -->
                            <n-empty description="Nessun Libro trovato in questo scaffale"
                                v-if="scaffale.data.libri?.length === 0 || !scaffale.data.libri" />

                            <!-- griglia dei libri contenuti nello scaffale -->
                            <div class="griglia_libri" v-else>

                                <div class="scheda_libro_singola" v-for="libro in scaffale.data.libri"
                                    :key="libro.id">
                                    <LibriCard :titolo="'(id:' + libro.id + ') ' + libro.titolo"
                                        :immagine="libro.copertina" alt="Copertina Libro" :info_autore="libro.autore"
                                        :info_anno="libro.anno" :visualizza_footer="false"
                                        @click-dettagli-libro="vaiAlLibroId(libro.id)" />
                                </div>

                            </div>
                            <div>
                                <n-divider />
                                <div class="azioni_utente">

                                    <!-- azioni disponibili solo al proprietario dello scaffale -->
                                    <n-space v-if="is_utente_proprietario">
                                        <n-button @click="aggiungiLibro" type="primary" ghost
                                            title="Crea e aggiungi un nuovo libro">Aggiungi Libro
                                        </n-button>
                                        <n-button @click="aggiungiLibroISBN" type="primary" ghost
                                            title="Aggiungi un libro da catalogo Master">Nuovo da Master
                                        </n-button>
                                        <n-button @click="vaiModificaScaffale" type="warning"
                                            title="Modifica Scaffale">Modifica Scaffale
                                        </n-button>
                                        <n-button @click="deleteScaffale" title="Elimina Scaffale" type="error">Elimina
                                            Scaffale
                                        </n-button>
                                    </n-space>
                                </div>
                            </div>
                            <ModaleConferma v-model:show="mostra_modale_conferma" titolo="Elimina Scaffale"
                                :messaggio="'Sei sicuro di voler eliminare lo scaffale ' + scaffale?.data.nome + '? L\'azione è irreversibile.'"
                                testoConferma="Elimina Definitivamente" tipo="warning"
                                @conferma="eseguiCancellazione" />
                        </template>
                    </div>
                </div>
            </n-spin>
        </section>
    </div>
</template>

<script setup>
    import { useUtentiStore } from '@/stores/utentiStore'
    import { useScaffaliStore } from '@/stores/scaffaliStore'
    import { useRoute, useRouter } from 'vue-router'
    import { computed, onMounted, ref, nextTick} from 'vue'
    import ModaleConferma from '@/components/ModaleConferma.vue'
    import { useMessage } from 'naive-ui'
    import LibriCard from '@/components/LibriCard.vue'
    import Mappa from '@/components/Mappa.vue'

    const message = useMessage()
    const utenti_store = useUtentiStore()
    const scaffali_store = useScaffaliStore()
    const route = useRoute()
    const router = useRouter()

    //STATI
    const scaffale = ref(null) 
    const mostra_modale_conferma = ref(false) 
    const is_cancellazione_in_corso = ref(false)
    //verifico proprietà dello scaffale
    const is_utente_proprietario = computed(() => {
        //mi assicuro che i dati siano caricati
        if (!scaffale.value || !utenti_store.utente) {
            return false
        }
        // confronto id utente dello scaffale con id utente loggato
        return scaffale.value.data.utente.id === utenti_store.utente.id
    })

    //permette di aggiungere libri manualmente
    function aggiungiLibro() {
        //console.log("aggiungiLibro")
        router.push({ name: 'AggiungiLibro' })
    }

    function aggiungiLibroISBN() {
        //console.log("aggiungiLibroISBN") 
        router.push({ name: 'CatalogoLibriMaster'})
    }

    function deleteScaffale() {
        mostra_modale_conferma.value = true
    }

    //permette di visualizzare i dettagli del libro selezionato 
    function vaiAlLibroId(id) {
        //console.log("vaiAlLibroId")
        router.push({ name: 'ModificaLibro', params:{id}})
    }

    // naviga alla pagina di modifica passando l'id
    function vaiModificaScaffale() {
        router.push({ name: 'ModificaScaffale', params: { id: scaffale.value.data.id } })
    }

    // cancellazione scaffale
    async function eseguiCancellazione() {
        try {
            is_cancellazione_in_corso.value = true
            await nextTick()
            // chiamo lo store per eliminare definitivamente
            await scaffali_store.deleteScaffale(scaffale.value.data.id)
            mostra_modale_conferma.value = false
            message.success("Scaffale eliminato correttamente")

            router.replace({ name: 'Libreria' }) //'replace' è meglio dopo una cancellazione perché impedisce di tornare indietro su un elemento morto

        } catch (err) {
            mostra_modale_conferma.value = false
            is_cancellazione_in_corso.value = false 
            message.error(err.message || 'Errore durante l\'eliminazione')
            console.error('Errore durante l\'eliminazione', err)
        } 
    }

    onMounted(async () => {
        //ottengo l'id dal parametro nell'URL
        const scaffale_id = route.params.id
        //console.log(scaffale_id)        

        // controllo validita id
        if (!scaffale_id || isNaN(scaffale_id)) {
            message.error('ID Scaffale non valido')
            //router.push({ name: 'Libreria' })
            return
        }

        try {
            const scaffale_recuperato = await scaffali_store.getScaffaleById(scaffale_id)
            // se lo scaffale non esiste nel db
            if (!scaffale_recuperato.data) {
                router.push({ name: 'Libreria' }) // torno alla libreria
                message.error('Risorsa non trovata. Reindirizzamento in corso...')
                return
            }
            // assegno i dati allo stato locale
            //scaffale.value = scaffale_recuperato.data
            scaffale.value = scaffali_store.scaffale_selezionato
            //console.log("Scaffale recuperato",scaffale.value)

            // controllo se chi visualizza è il proprietario
            if (!is_utente_proprietario.value) {
                router.push({ name: 'Libreria' })
                message.error('Non autorizzato. Reindirizzamento in corso...')
                return
            }

        } catch (err) {
            console.error("Errore nel caricamento dello scaffale", err)
            message.error(err.message || "Errore nel caricamento dello scaffale")
            scaffale.value = null

        }
    })
</script>


<style scoped>

.contenitore_mappa {
    margin-bottom: 2rem; /* spazio sotto il contenitore della mappa */
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    height: clamp(18.75rem, 40vh, 31.25rem);/* altezza della card dinamica */
    overflow: hidden;/* nasconde le parti di mappa che escono dagli angoli arrotondati */
}

/* rimuovo il padding interno della card Naive per far toccare la mappa ai bordi */
.contenitore_mappa :deep(.n-card__content) {
    padding: 0 !important; /* forza zero padding per full width */
    height: 100%; /* assicura che il contenuto occupi tutta l'altezza disponibile */
}

.griglia_libri {
    display: flex; 
    flex-wrap: wrap;/* permette agli elementi di andare a capo se non c'e spazio */
    gap: 1.5rem;/* spazio tra le card */
    width: 100%; 
    justify-content: center; 
    padding: 1rem 0; /* spazio verticale sopra e sotto la griglia */
}

.contenuto_scaffale {
    width: 100%; 
    display: flex;
    flex-direction: column; /* dispone gli elementi in colonna verticale mappa, carousel e bottoni*/
}

.scheda_libro_singola {
    flex: 0 1 auto; /* il libro non cresce ma puo ridursi se necessario */
    
}

.azioni_utente {
    margin-top: 2rem; /* distanzia dalla griglia dei libri sopra */
    padding-bottom: 2rem; /* spazio in fondo alla pagina */
}

.n-card {
    box-shadow: var(--box-shadow);
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .pagina_scaffale {
        padding: 1rem; /* riduce padding laterale su schermi piccoli */
    }

    .griglia_libri {
        gap: 1rem; /* riduce lo spazio tra i libri su mobile */
    }

    .contenitore_mappa {
        height: 15.625rem; 
        margin-bottom: 1.25rem; /* riduce margine inferiore */
    }


}


</style>
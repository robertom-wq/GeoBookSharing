<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- spinner di caricamento, attivo finché i dati dello scaffale non sono disponibili -->
            <n-spin :show="scaffali_store.loading || !scaffale">

                <!-- contenuto visibile solo quando lo scaffale è caricato -->
                <div v-if="scaffale">
                    <!-- intestazione dello scaffale -->
                    <div class="intestazione">
                        <h1>{{ scaffale.scaffale.nome }}</h1>

                        <!-- descrizione dello scaffale -->
                        <p class="sottotitolo">{{ scaffale.scaffale.descrizione }}</p>
                    </div>

                    <!-- contenuto principale dello scaffale -->
                    <div class="contenuto_scaffale">
                        <template v-if="scaffale">

                            <!-- contenitore della mappa (Leaflet) -->
                            <div class="contenitore_mappa">
                                <!-- contenitore della mappa Leaflet - da implementare -->
                            </div>
                            <n-divider />
                            <!-- titolo sezione libri -->
                            <n-h3>Libri contenuti</n-h3>

                            <!-- stato vuoto se nessun libro presente -->
                            <n-empty description="Nessun Libro trovato in questo scaffale"
                                v-if="scaffale.scaffale.libri?.length === 0 || !scaffale.scaffale.libri" />

                            <!-- griglia dei libri contenuti nello scaffale -->
                            <div class="griglia_libri" v-else>

                                <div class="scheda_libro_singola" v-for="libro in scaffale.scaffale.libri"
                                    :key="libro.id">
                                    <LibriCard :titolo="'(id:' + libro.id + ') ' + libro.titolo"
                                        :immagine="libro.copertina" alt="Copertina Libro" :info_autore="libro.autore"
                                        :info_anno="libro.anno" :visualizza_footer="false"
                                        @click-dettagli-libro="vaiAlLibroId(libro.id)" />
                                </div>

                            </div>
                            <div>
                                <n-divider />
                                <!-- sezione azioni utente -->
                                <div class="azioni_utente">

                                    <!-- azioni disponibili solo al proprietario dello scaffale -->
                                    <n-space v-if="is_utente_proprietario">
                                        <!-- aggiunta manuale di un nuovo libro -->
                                        <n-button @click="aggiungiLibro" type="primary" ghost
                                            title="Crea e aggiungi un nuovo libro">Aggiungi Libro
                                        </n-button>
                                         <!-- aggiunta libro da catalogo Master tramite ISBN -->
                                        <n-button @click="aggiungiLibroISBN" type="primary" ghost
                                            title="Aggiungi un libro da catalogo Master">Nuovo da Master
                                        </n-button>
                                        <!-- modifica dei dati dello scaffale -->
                                        <n-button @click="vaiModificaScaffale" type="warning"
                                            title="Modifica Scaffale">Modifica Scaffale
                                        </n-button>
                                        <!-- eliminazione definitiva dello scaffale -->
                                        <n-button @click="deleteScaffale" title="Elimina Scaffale" type="error">Elimina
                                            Scaffale
                                        </n-button>
                                    </n-space>
                                </div>
                            </div>
                            <!-- modale di conferma eliminazione scaffale -->
                            <ModaleConferma v-model:show="mostra_modale_conferma" titolo="Elimina Scaffale"
                                :messaggio="'Sei sicuro di voler eliminare lo scaffale ' + scaffale?.scaffale.nome + '? L\'azione è irreversibile.'"
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
    import { computed, onMounted, ref } from 'vue'
    import ModaleConferma from '@/components/ModaleConferma.vue'
    import { useMessage } from 'naive-ui'
    import LibriCard from '@/components/LibriCard.vue'

    const message = useMessage()
    const utenti_store = useUtentiStore()
    const scaffali_store = useScaffaliStore()
    const route = useRoute()
    const router = useRouter()

    //STATI
    const scaffale = ref(null) // oggetto reattivo per i dati dello scaffale
    const mostra_modale_conferma = ref(false) // flag per visibilita modale cancellazione

    //verifico proprietà dello scaffale
    const is_utente_proprietario = computed(() => {
        //mi assicuro che i dati siano caricati
        if (!scaffale.value || !utenti_store.utente) {
            return false
        }
        // confronto id utente dello scaffale con id utente loggato
        return scaffale.value.scaffale.utente.id === utenti_store.utente.id
    })

    //AZIONI
    //permette di aggiungere libri manualmente
    function aggiungiLibro() {
        console.log("aggiungiLibro") // da implementare
    }

    //permette di aggiungere libri tramite codice ISBN
    function aggiungiLibroISBN() {
        console.log("aggiungiLibroISBN") // da implementare
    }
    function deleteScaffale() {
        mostra_modale_conferma.value = true
    }

    //permette di visualizzare i dettagli del libro selezionato 
    function vaiAlLibroId(id) {
        console.log("vaiAlLibroId") // da implementare
    }

    // naviga alla pagina di modifica passando l'id
    function vaiModificaScaffale() {
        router.push({ name: 'ModificaScaffale', params: { id: scaffale.value.scaffale.id } })
    }

    // cancellazione scaffale
    async function eseguiCancellazione() {
        try {
            // chiamo lo store per eliminare definitivamente
            await scaffali_store.deleteScaffale(scaffale.value.scaffale.id)
            router.push({ name: 'Libreria' }) // redirect alla breria
            message.success("Scaffale eliminato correttamente")

        } catch (err) {
            message.error(err.message || 'Errore durante l\'eliminazione')
            console.error('Errore durante l\'eliminazione', err)
        } finally {
            mostra_modale_conferma.value = false // chiude la modale in ogni caso
        }
    }

    onMounted(async () => {
        //ottengo l'id dal parametro nell'URL
        const scaffale_id = route.params.id
        console.log(scaffale_id)

        // controllo validita id
        if (!scaffale_id || isNaN(scaffale_id)) {
            message.error('ID Scaffale non valido')
            //router.push({ name: 'Libreria' })
            return
        }

        try {
            // recupero dati dal server tramite store scaffali_store
            const scaffale_recuperato = await scaffali_store.getScaffaleById(scaffale_id)

            // se lo scaffale non esiste nel db
            if (!scaffale_recuperato) {
                router.push({ name: 'Libreria' }) // torno alla libreria
                message.error('Risorsa non trovata. Reindirizzamento in corso...')
                return
            }
            // assegno i dati allo stato locale
            scaffale.value = scaffale_recuperato
            console.log(scaffale_recuperato.scaffale)

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
/* Contenitore principale */

/* Area Mappa */
.contenitore_mappa {
    margin-bottom: 2rem; /* spazio sotto il contenitore della mappa */
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    height: clamp(18.75rem, 40vh, 31.25rem);/* definisce l'altezza della card dinamicamente tra 300px e 500px in base all'altezza dello schermo */
    overflow: hidden;/* nasconde le parti di mappa che escono dagli angoli arrotondati */
}

/* rimuovo il padding interno della card Naive per far toccare la mappa ai bordi */
.contenitore_mappa :deep(.n-card__content) {
    padding: 0 !important; /* forza zero padding per full width */
    height: 100%; /* assicura che il contenuto occupi tutta l'altezza disponibile */
}

/* griglia dei libri */
.griglia_libri {
    display: flex; /* attiva layout flessibile */
    flex-wrap: wrap;/* permette agli elementi di andare a capo se non c'e spazio */
    gap: 1.5rem;/* spazio tra le card */
    width: 100%; /* occupa tutta la larghezza */
    justify-content: center; /* centra le card orizzontalmente nella riga */
    padding: 1rem 0; /* spazio verticale sopra e sotto la griglia */
}

.contenuto_scaffale {
    width: 100%; /* larghezza piena */
    display: flex;/* layout flessibile */
    flex-direction: column; /* dispone gli elementi in colonna verticale mappa, carousel e bottoni*/
}

/* Elemento singolo libro (per gestire il layout) */
.scheda_libro_singola {
    flex: 0 1 auto; /* il libro non cresce ma puo ridursi se necessario */
    
}

/* Area pulsanti azioni */
.azioni_utente {
    margin-top: 2rem; /* distanzia dalla griglia dei libri sopra */
    padding-bottom: 2rem; /* spazio in fondo alla pagina */
}

/* Forziamo la responsività dei bottoni Naive UI nel contenitore azioni */
.azioni_utente :deep(.n-space) {
    gap: 1rem !important; /* imposta spazio forzato i bottoni */
    justify-content: center !important; /*Bottoni su lato destro */
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

    /* Rendiamo i pulsanti d'azione a tutta larghezza su mobile per il touch */
    .azioni_utente :deep(.n-space) {
        flex-direction: column !important; /* dispone i bottoni uno sopra l'altro */
    }

    .azioni_utente :deep(.n-button) {
        width: 100%;/* occupa tutta la larghezza */
        height: 2.5rem; /* bottone piu largo, per agevolare touch */
    }

    .contenitore_mappa {
        height: 15.625rem; /* altezza fissa su mobile circa 250px */
        margin-bottom: 1.25rem; /* riduce margine inferiore */
    }
}


</style>
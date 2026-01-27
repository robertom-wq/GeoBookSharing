<template>
    <!-- contenitore principale della pagina -->
    <div class="page">
        <section>
            <!-- intestazione della libreria -->
            <div class="intestazione">

                <!-- titolo principale -->
                <h1>La tua Libreria</h1>

                <!-- sottotitolo con messaggio di benvenuto e riepilogo scaffali -->
                <p class="sottotitolo">Ciao {{ utenti_store.utente?.nome.toUpperCase() }}. <br>
                    Gestisci la tua libreria aggiungendo o modificando i tuoi scaffali.
                    <br>
                    <!-- conteggio totale degli scaffali dell'utente -->
                    Attualmente possiedi <span class="evidenza_numero">
                        {{ scaffali_store?.conteggio_scaffali_totali }}</span>
                    <a
                        v-if="scaffali_store?.conteggio_scaffali_totali > 1 || scaffali_store?.conteggio_scaffali_totali == 0">
                        scaffali</a>
                    <a v-if="scaffali_store?.conteggio_scaffali_totali == 1"> scaffale</a>
                </p>
            </div>
            <div class="contenuto_libreria">
                <div id="contenitore_mappa">

                    <!-- contenitore della mappa Leaflet - da implementare -->

                </div>
                <!-- carousel degli scaffali (visibile solo se esistono scaffali) -->
                <div class="carousel_scaffali"
                    v-if="scaffali_store.scaffali_utente && scaffali_store.conteggio_scaffali_totali > 0">
                     <!-- carousel naive in modalità card -->
                    <n-carousel effect="card" prev-slide-style="transform: translateX(-150%) translateZ(-800px)"
                        next-slide-style="transform: translateX(50%) translateZ(-800px)" style="height: 240px;"
                        :show-dots="true" :key="scaffali_store.conteggio_scaffali_totali" :autoplay="false"
                        @update:current-index="gestisciCambioCarousel">
                        <!-- scheda scaffale -->
                        <n-carousel-item v-for="(scaffale, index) in scaffali_store.scaffali_utente" :key="scaffale.id">
                            <n-card :title="scaffale.nome" size="medium" class="scheda_scaffale">
                                <!-- badge con numero di libri nello scaffale -->
                                <template #header-extra>
                                    <n-badge :value="scaffale.libri?.length || 0" type="info" />
                                </template>
                                <!-- corpo della scheda -->
                                <div class="corpo_scheda">
                                    <n-text depth="3" class="testo_descrizione">
                                        {{ troncaStringa(scaffale.descrizione) || 'Nessuna descrizione presente per questo scaffale.' }}
                                    </n-text>
                                </div>
                                <!-- footer con bottone per entrare nella pagina di dettaglio scaffale -->
                                <template #footer>
                                    <n-button  type="warning" round
                                        @click="vaiDettagliScaffale(scaffale.id)">
                                        Gestisci Scaffale
                                    </n-button>
                                </template>
                            </n-card>
                        </n-carousel-item>
                    </n-carousel>

                </div>
                    <!-- stato vuoto, nessuno scaffale presente -->
                    <n-empty v-else-if="!scaffali_store.loading" description="Non hai acora creato nessun scaffale. Aggiungine uno!"/>
            </div>
        </section>
        <section>
            <div id="contenitore_pulsante_creazione">
                <n-button type="primary"  @click="vaiCreaScaffale">
                    Aggiungi Scaffale
                </n-button>
            </div>
        </section>
    </div>
</template>


<script setup>
import { useUtentiStore } from '@/stores/utentiStore'
import { useScaffaliStore } from '@/stores/scaffaliStore';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { troncaStringa } from '@/utils/toolkit'

const utenti_store = useUtentiStore()
const scaffali_store = useScaffaliStore()
const router = useRouter()

//STATI
// questo sarà utile per aggiornare la posizione nella mappa in base all'elemento attivo del carousel
const indice_carousel_corrente = ref(0)

//AZIONI
//porta l'utente alla creazione
function vaiCreaScaffale() {
    //naviga verso la rotta per la creazione di un nuovo scaffale
    console.log("Vai alla rotta nuovo scaffale")
    router.push({ name: 'AggiungiScaffale' })
}

//porta l'utente al dettaglio
function vaiDettagliScaffale(scaffale_id) {
    //naviga verso la rotta per la visualizzazione di uno scaffale
    console.log("Vai alla rotta dettagli scaffale")
    router.push({ name: 'DettaglioScaffale', params: { id: scaffale_id } })
}

// Gestisce l'evento di scorrimento del carousel aggiornando l'indice
function gestisciCambioCarousel(index) {
    indice_carousel_corrente.value = index
    console.log("Nuovo indice carousel", indice_carousel_corrente.value)

}

onMounted(async () => {
    //appena la pagina è pronta, chiedo al server gli scaffali dell'utente
    await scaffali_store.getMieiScaffali()
    
})


</script>


<style scoped>
/* Contenitore principale */
.contenuto_libreria {
    padding: 2vw; /* spaziatura responsive rispetto alla larghezza viewport */
    max-width: var(--container-max-width); /* limita estensione su schermi grandi */
    margin: 0 auto; /* centra orizzontalmente il contenuto */
}

/* evidenzia il numero totale degli scaffali */
.evidenza_numero {
    font-size: 1.25rem; 
    font-weight: bold;
    color: var(--btn-primary-color);
}

/* Area Mappa */
#contenitore_mappa {
    border-radius: var(--border-radius);
    overflow: hidden; /* evita che la mappa esca dai bordi */
    margin-bottom: 1.875rem; /* 30px */
    border: 0.0625rem solid #eee;
    box-shadow: var(--box-shadow);
    height: clamp(20rem, 50vh, 35rem);/* Altezza dinamica del contenitore della mappa */  
    position: relative; /* Aiuta Leaflet a posizionarsi correttamente */
    
}

/* Assicuriamoci che il componente Mappa occupi tutto lo spazio */
#contenitore_mappa :deep(.sezione_mappa_inner),
#contenitore_mappa :deep(.mappa_container) {
    height: 100% !important;
}

/* Gestione carousel*/
.carousel_scaffali {
    margin-top: 3.25rem;
    margin-bottom: 3.25rem; 
    width: 100%;
}

:deep(.n-carousel) {
    height: 18rem!important; /*  */
}

/* la slide del carousel occupa il 60% dello spazio orizzontale */
:deep(.n-carousel__slides) .n-carousel__slide {
    width: 60% !important; 
}

/* Scheda Scaffale */
.scheda_scaffale {
    background-color: var(--pearl-white-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    height: 95%; /* lascio un piccolo margine verticale */
}

.corpo_scheda {
    padding: 0.5rem 0;
}

/* Testo descrizione scaffale con altezza minima per allineamento visivo */
.testo_descrizione {
    font-style: italic;
    display: block;
    margin-bottom: 0.9375rem; /* 15px */
    min-height: 2.5rem; /* 40px */
}

/* Pulsante Creazione */
#contenitore_pulsante_creazione {
    display: flex;
    justify-content: center; /* Centra il pulsante orizzontalmente */
    margin-top: 1.5rem;
    padding-bottom: 2rem;
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {

    /* Su mobile le slide del carosello occupano più spazio orizzontale */
    :deep(.n-carousel__slides) .n-carousel__slide {
        width: 85% !important;
    }

    :deep(.n-carousel) {
        height: 17rem; /* Leggermente più alto per evitare tagli sui testi */
    }

    .carousel_scaffali {
        margin-top: 3.25rem;
        margin-bottom: 3.25rem; 
        width: 100%;
    }

    #contenitore_pulsante_creazione :deep(.n-button) {
        width: 100%; /* Pulsante a tutta larghezza su mobile */
        height: 2.5rem;
    }
    #contenitore_mappa {
        height: 20rem; /* Altezza leggermente ridotta su mobile */
    }
}
</style>
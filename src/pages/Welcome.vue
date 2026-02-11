<template>
    <div class="page">
        <section class="schermata_iniziale">
            <div class="contenuto_principale">
                <h1>GeoBookSharing</h1>
                <p class="testo_sottotitolo">
                    Più vicini, pagina dopo pagina. La rete geolocalizzata per chi ama leggere e condividere: dal tuo
                    scaffale a chi vive vicino a
                    te.
                </p>
                <p class="testo_sottotitolo_secondario">
                    Crea il tuo scaffale, geolocalizza i tuoi libri e inizia a condividere...
                </p>
                <div class="pulsanti_azione" v-if="!utenti_store.utente">
                    <NButton  @click="router.push('/login')" type="info">Accedi</NButton>
                    <NButton  @click="router.push('/registrati')">Registrati</NButton>
                </div>
                <!-- creare condizione se utente loggato, mostra questo-->
                <div class="pulsanti_azione" v-else>
                    <NButton @click="router.push('/profilo')" type="info">Vai al profilo</NButton>
                </div>
            </div>
        </section>
        <n-divider />
        <section>
            <div class="contenitore_funzionalita">
                <n-card title="Crea uno scaffale">
                    <template #cover>
                        <img src="/crea_scaffale.png">
                    </template>
                    Crea uno o più scaffali geolocalizzati, oranizzali per genere o posizione geografica
                </n-card>
                <n-card title="Aggiungi i tuoi libri">
                    <template #cover>
                        <img src="/aggiungi_libri.png">
                    </template>
                    Popola i tuoi scaffali con i libri in tuo possesso
                </n-card>
                <n-card title="Condividi con la community">
                    <template #cover>
                        <img src="/condividi.png">
                    </template>
                    Scegli un metodo di condivisione per ogni tuo libro
                </n-card>
            </div>

        </section>

    </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useUtentiStore } from '@/stores/utentiStore'

// inizializzo il router per gestire i click sui bottoni e cambiare pagina
const router = useRouter()

// inizializzo lo store per sapere se l'utente è loggato
const utenti_store = useUtentiStore()

</script>

<style scoped>
/* Contenitore principale */
.schermata_iniziale {
    position: relative;
    overflow: hidden;
    display: flex;
    /* layout Flexbox  */
    align-items: center;
    /* Centra verticalmente */
    justify-content: center;
    /* Centra orizzontalmente */
    padding: 2vw 0;
    /* imposto padding fluido basato sulla larghezza schermo */

}

/*Contenuto testuale della pagina */
.schermata_iniziale .contenuto_principale {
    margin: 2rem;
    position: relative;
    padding: 1rem;
    text-align: center;
    /* Testo centrato del contenuto testuale */
}

/* Titolo Principale (H1) */
.schermata_iniziale h1 {
    font-size: clamp(2rem, 6vw, 3.75rem);/* Titolo fluido: minimo 32px, massimo 60px */    
    font-weight: 700; /* grassetto più evidente */
    margin-bottom: 1rem; /* spazio sotto il titolo */
    letter-spacing: -0.02em; /* caratteri piu vicini */
}

/* Sottotitolo descrittivo (stile corsivo) */
.testo_sottotitolo {
    font-size: clamp(1rem, 2.5vw, 1.2rem);/* Font size adattivo tra 16px e 19px circa */
    line-height: 1.6; /* Interlinea  piu alta per migliorare leggibilità */
    margin: 0 auto 1.5rem;/* centrato orizzontalmente (auto) e margine sotto */
    opacity: 0.9; /*leggermente meno nero*/
    font-style: italic;
    max-width: 50rem; /* Limita la larghezza per una lettura ottimale */
}

/* sottotitolo secondario */
.testo_sottotitolo_secondario {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    line-height: 1.6;
    margin: 0 auto 1rem;/* centrato orizzontalmente (auto) e margine sotto */
    opacity: 0.9; /*leggermente meno nero*/
    font-weight: 900;    /* grasseto molto evidente */
}

.n-button{
    min-width: 10rem;
}

/* Contenitore delle card esplicative delle funzionalità del sistema */
.contenitore_funzionalita {
    display: flex; /* layout Flexbox  */
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    margin: 2rem 5vw; /* margini in unita relative */    

}


/* Card sezione contenitore_funzionalita, NON uso :deep in quanto l'elemento è già definito nel template */
.n-card {
    max-width: 300px !important; /*Imposto larghezza massima */
    background: var( --white-bg);
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: var(--box-shadow);
    color: var(--color-text-dark);

    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
/* Comportamento durante il passaggio con il mouse */
.n-card:hover {
    transform: translateY(-10px); /*spostamento verso l'alto di 10px*/
    box-shadow: 0 12px 24px rgba(81, 86, 150, 0.842); /* ombra più profonda e scura*/    
}

/* titolo della card, uso :deep per raggiungere le proprietà interna del componente naive */
:deep(.n-card-header__main) {
    font-weight: 700!important; /*grassetto per farlo risaltare subito*/
    font-size: 1.1rem;
}

:deep(.n-card__content) {
    color: var(--color-text-dark);
    font-size: 0.95rem; /*Dimensione fon leggermente piu piccola */
    line-height: 1.5; /* interlinea piu ampia*/
}


/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .schermata_iniziale .contenuto_principale {
       margin: 2rem 0 0 0; 
    }
    .contenitore_funzionalita {
        margin: 1.5rem 1rem;
        gap: 1.5rem;
    }
}
</style>
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
                <div class="pulsanti_azione">
                    <NButton type="info">Accedi</NButton>
                    <NButton>Registrati</NButton>
                </div>
                <!-- creare condizione se utente loggato, mostra questo-->
                <div class="pulsanti_azione">
                    <NButton type="info">Vai al profilo</NButton>
                </div>
            </div>
        </section>
        <n-divider />
        <section>
            <div class="contenitore_funzionalita">
                <!--INSERIRE 3 CARD CHE DESCRIVONO LE FUNZIONALITA DELL'APPLICAZIONE-->
                <n-card title="Card">
                    Card Content 1
                </n-card>
                <n-card title="Card">
                    Card Content 2
                </n-card>
                <n-card title="Card">
                    Card Content 3
                </n-card>
            </div>

        </section>

    </div>
</template>

<script setup>
import { NButton } from 'naive-ui';
import { useRouter } from 'vue-router'

// inizializzo il router per gestire i click sui bottoni e cambiare pagina
const router = useRouter()

</script>

<style scoped>
/* Contenitore principale */
.schermata_iniziale {
    position: relative;
    overflow: hidden;
    display: flex; /* layout Flexbox  */
    align-items: center; /* Centra verticalmente */
    justify-content: center; /* Centra orizzontalmente */
    padding: 2vw 0; /* imposto padding fluido basato sulla larghezza schermo */
    
}

/*Contenuto testuale della pagina */
.schermata_iniziale .contenuto_principale {
    margin: 2rem;
    position: relative;
    padding: 1rem;
    text-align: center; /* Testo centrato del contenuto testuale */
}

/* Titolo Principale (H1) */
.schermata_iniziale h1 {
    font-size: clamp(2rem, 6vw, 3.75rem);  /* Titolo fluido: minimo 32px, massimo 60px */
    font-weight: 700; /* grassetto più evidente */
    margin-bottom: 1rem; /* spazio sotto il titolo */
    letter-spacing: -0.02em; /* caratteri piu vicini */
}

/* Sottotitolo descrittivo (stile corsivo) */
.testo_sottotitolo {
    font-size: clamp(1rem, 2.5vw, 1.2rem);  /* Font size adattivo tra 16px e 19px circa */
    line-height: 1.6; /* Interlinea  piu alta per migliorare leggibilità */
    margin: 0 auto 1.5rem; /* centrato orizzontalmente (auto) e margine sotto */
    opacity: 0.9; /*leggermente meno nero*/
    font-style: italic;
    max-width: 50rem;  /* Limita la larghezza per una lettura ottimale */
}

/* sottotitolo secondario */
.testo_sottotitolo_secondario {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    line-height: 1.6;
    margin: 0 auto 1rem; /* centrato orizzontalmente (auto) e margine sotto */
    opacity: 0.9; /*leggermente meno nero*/
    font-weight: 900; /* grasseto molto evidente */
}

/* Contenitore dei pulsanti*/
.pulsanti_azione {
    padding-top: 2rem; /*distanzia i bottoni dal testo */
    display: flex; /* layout Flexbox  */
    gap: 1.5rem !important; /* Spazio piu largo tra i bottoni per agevolare click */
    justify-content: center; /* Centratura bottoni nel contenitore */
}

/* Contenitore delle card esplicative delle funzionalità del sistema */
.contenitore_funzionalita {
    display: flex; /* layout Flexbox  */
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    /* Margini in unità relative */
    margin: 2rem 5vw;
}


/* Card sezione contenitore_funzionalita */
.n-card {
  max-width: 300px !important; /*Imposto larghezza massima */
}


/* Impostazioni  */
@media (max-width: 768px) {
    .pulsanti_azione {
        flex-direction: column; /* bottoni uno sopra l'altro */
        align-items: stretch; /* i bottoni occupano tutta la larghezza */
        padding: 2rem 10% 0; /* padding laterale del 10% per non toccare i bordi dello schermo */
    }

    .schermata_iniziale .contenuto_principale {
        margin: 1rem;
        padding: 0.5rem;
    }

    .contenitore_funzionalita {
        margin: 1.5rem 1rem;
        gap: 1.5rem;
    }
}
</style>
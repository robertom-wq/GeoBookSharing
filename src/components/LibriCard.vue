<template>
  <!-- card che mostra una miniatura del libro con informazioni a seguito di ricerca -->
  <n-card hoverable class="libro_card"  @click="$emit('click-dettagli-libro')">

     <!-- contenuto principale della card -->
    <div class="card_container">

      <!-- immagine di copertina con fallback -->
      <img 
        :src="immagine ? (url_immagine + '/' + immagine) : immagine_placeholder" 
        :alt="alt || 'Copertina libro'" 
        class="immagine_sfondo"
        @error="gestisciErroreCaricamentoIMG"
      >

      <!-- dati del libro -->
      <div class="dati_libro">
        <div class="content_text">
          <p class="titolo">{{ troncaStringa(titolo, 80) }}</p>

          <!-- area info aggiuntive libro -->
          <div class="info_aggiuntive">
            <p class="autore">di {{ troncaStringa(info_autore, 50) || 'Sconosciuto' }}</p>
            <p v-if="info_anno" class="anno">Edizione: {{ info_anno }}</p>

            <!-- informazioni proprietario e vicinanza-->
            <div v-if="info_scaffale_proprietario" class="scaffale_box">
              <n-tag :bordered="false" size="small" type="info">
                Proprietario: {{ info_scaffale_proprietario }}
              </n-tag>
              <n-tag :bordered="false" size="small" type="info">
                Distanza: {{ info_distanza_km }} km
              </n-tag>
            </div>
          </div>
        </div>
        <!-- footer della card con bottone -->
        <div v-if="visualizza_footer" class="footer_action">
          <n-button secondary type="primary" size="small" block @click.stop="$emit('click-richiedi-condivisione')">
            Richiedi Condivisione
          </n-button>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { troncaStringa } from '@/utils/toolkit'
const url_immagine = import.meta.env.VITE_ROOT_URL

const props = defineProps({
    titolo: String,
    immagine: String,
    immagine_placeholder: {
        type: String,
        default: '/placeholder_libro.jpg'
    },
    info_autore: String,
    info_anno: [String, Number],
    info_scaffale_nome: String,
    info_scaffale_proprietario: String,
    info_distanza_km: [String, Number],
    visualizza_footer: {
        default: true,
        type: Boolean
    },
    alt: String,
    visualizzazioni: [String, Number]
})

const emit = defineEmits(['click-dettagli-libro', 'click-richiedi-condivisione'])

const gestisciErroreCaricamentoIMG = (event) => {
  // Sostituisce l'src che ha dato errore con il path del placeholder
  event.target.src = props.immagine_placeholder
}
</script>

<style scoped>
.libro_card {
  /* Uso i rem in modo tale che se l'utente cambia la dimensione del font nel browser, la card scala correttamente */
  width: 100%; /* La card occupa tutto lo spazio del suo contenitore (griglia) */
  max-width: 20rem!important; 
  height: 25rem !important; 
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
  border: none;
  position: relative; /* per il posizionamento absolute dell'overlay dati */
  background-color: var(--pearl-white-bg);
  border-radius: var(--border-radius) !important;
}

/* :deep per accedere al componente n-card di naive e forzare rimozione padding interno */
:deep(.n-card__content) {
  padding: 0 !important;
}

.card_container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.immagine_sfondo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* L'Overlay Glassmorphism */
.dati_libro {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  
  /* Altezza iniziale: 80px -> 5rem */
  height: 5rem; 
  background: rgba(255, 255, 255, 0.85); /* Sfondo semitrasparente bianco */
  backdrop-filter: blur(0.75rem); /* effetto vetro sfocato*/
  -webkit-backdrop-filter: blur(0.75rem); /* Compatibilità per Safari */
  padding: 0.9375rem; /* 15px */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 0.0625rem solid rgba(255, 255, 255, 0.3);
}

/*  solo per dispositivi con mouse */
@media (hover: hover) {
  .libro_card:hover .dati_libro {
    height: 85%; /*la sezione dati_libro sale quasi fino in cima per mostrare i dettagli */
    background: rgba(255, 255, 255, 0.95);
  }

  .libro_card:hover .immagine_sfondo {
    transform: scale(1.1); /* Leggero zoom della copertina al passaggio del mouse */
  }

  .libro_card:hover .info_aggiuntive,
  .libro_card:hover .footer_action {
    opacity: 1;
    transition-delay: 0.1s; /* Aspetta 100ms prima prima di mostrare il contenuto dei dettagli */
  }
}

.titolo {
  margin: 0 0 0.625rem 0;
  font-size: 1rem !important;
  font-weight: bold;
  color: var(--color-text-dark);
  line-height: 1.2;
  min-height: 2.5rem; /* 40px */
}

.info_aggiuntive {
  opacity: 0; /* nascoste di default su desktop, appaiono al hover */
  transition: opacity 0.3s ease;
}

.autore {
  margin: 0.3125rem 0;
  font-size: 0.9rem;
  color: var(--color-text-dark);
}

.anno {
  font-size: 0.8rem;
  color:var(--color-text-dark);
  font-style: italic;
}

.scaffale_box {
  margin-top: 0.9375rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

}

.footer_action {
  margin-top: auto;
  padding-top: 0.9375rem;
  opacity: 0;
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
  .libro_card {
    max-width: 100%; /* Su mobile le card possono allargarsi nella griglia */
    height: 25rem; /* Leggermente più alta per facilitare il tocco */
  }

  .dati_libro {
    /* Su mobile mostrio subito più informazioni poiché non c'è l'hover */
    height: 45%; 
    background: rgba(255, 255, 255, 0.9);
  }

  .info_aggiuntive, .footer_action {
    opacity: 1; /* Sempre visibili su mobile */
  }

  .titolo {
    font-size: 1.1rem!important; /* Titolo leggermente più grande per leggibilità */
  }
}
</style>
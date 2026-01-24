<template>
  <!--configurazione globale naive UI, imposto lingua italiana e override del tema di default-->
  <n-config-provider :locale="itIT" :theme-overrides="themeOverrides">
    <!--contenitori globali per uso di Messages e Dialogs -->
    <n-message-provider>
      <n-dialog-provider>
        <n-layout class="layout_principale">
          <header>
            <Navbar />
          </header>
          <!-- Layout del contenuto differenziato da quello della navbar e footer-->
          <n-layout-content class="contentuto_principale">
            <!--Contenuto dinamico in cui viene montato il componente in base alla rotta-->
              <router-view />
          </n-layout-content>
          <footer>
            <Footbar />
          </footer>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>

</template>

<style scoped></style>


<script setup>
import { NConfigProvider, NLayoutContent, NMessageProvider, NDialogProvider, NLayout, itIT } from 'naive-ui'
import Navbar from './components/Navbar.vue'
import Footbar from './components/Footbar.vue'
import { useUtentiStore } from './stores/utentiStore';
import { onMounted } from 'vue'

/* // uso lo store degli utenti per gestire l'accesso
const utenti_store = useUtentiStore()

// Appena l'app si carica, controllo se l'utente era già loggato (ripristino la sessione)
onMounted(async() => {
  // controllo se è presente csrf_token nel localStorage come indizio di utente autenticato
  const token_esistente = localStorage.getItem('csrf_token')
  console.log("token_esistente:", !!token_esistente )
    // Solo se il token esiste provo a recuperare il profilo
    if (token_esistente) {
      try {
        await utenti_store.getUtente()
        console.log("Utente loggato", utenti_store.utente.username)
      } catch (err) {
        // Se il token era nel localStorage ma è scaduto sul server
        console.warn('Sessione scaduta, pulizia in corso...')
        localStorage.removeItem('csrf_token')
      }
    } else {
      // Se non c'è il token, non chiamo nemmeno apiFetch
      console.log('Navigazione come ospite (nessun token trovato)')
    }
}) */

// sovrascrivo lo stile base di Naive UI
const themeOverrides = {
  common: {
    // Scelgo font e rendo tutto piu arrotondato
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '12px',

    // Il colore principale è questo azzurro, con diverse sfumature per hover e click 
    primaryColor: '#3194E7',
    primaryColorHover: '#5BA9EC',   // Più chiaro
    primaryColorPressed: '#1E74C0', // Più scuro
    primaryColorSuppl: '#5BA9EC',   // Per stati secondari

    // PALETTE WARNING (Default Naive UI - Arancio/Giallo)
    warningColor: '#f0a020',
    warningColorHover: '#fcb040',
    warningColorPressed: '#c97c10',

    // Altri colori di sistema
    infoColor: '#3194E7',
    successColor: '#18a058',
    errorColor: '#d03050',
  },
  Button: {
    // Sovrascrivo il border-radius solo per i bottoni
    borderRadiusMedium: '20px',
    borderRadiusSmall: '20px',
    borderRadiusLarge: '20px',
    fontWeight: '200'
  },
  Input: {
    //quando clicco su un input, voglio che si illumini del mio colore primario
    borderRadius: '12px',
    borderFocus: '1px solid #3194E7',
    boxShadowFocus: '0 0 0 2px rgba(49, 148, 231, 0.2)'
  },
  Card: {
    borderRadius: '12px'
  }
}
</script>

<style>
/* contenitore principale dell'applicazione */
.n-layout {
  display: flex; /* layout Flexbox  */
  flex-direction: column; /* posizione gli elementi verticalmente header, content, footer */
  min-height: 100vh; /* Almeno l'altezza dello schermo */
}

.contenuto_principale {
  flex: 1; /* Questo dice al contenuto di espandersi e spingere il footer in basso */
  flex-grow: 1 !important;

}

.n-layout-scroll-container {
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important; /* impone l'altezza 100vh anche al contenitore di scroll interno per evitare che il layout si rompa */

}
</style>
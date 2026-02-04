import { createRouter, createWebHistory } from 'vue-router'
import { useUtentiStore } from '@/stores/utentiStore'

// Importo pagine (lazy loading) in quanto rende piu veloce il caricamento dell'applicazione. Solo su richiesta
const Welcome = () => import('@/pages/Welcome.vue')
const Login = () => import('@/pages/Login.vue')
const Registrazione = () => import('@/pages/Registrazione.vue')
const Profilo = () => import('@/pages/Profilo.vue')
const Libreria = () => import('@/pages/Libreria.vue')
const DettaglioScaffale = () => import('@/pages/Scaffale.vue')
const AggiungiModificaScaffale = () => import('@/pages/AggiungiModificaScaffale.vue')
const AggiungiModificaLibro = () => import('@/pages/AggiungiModificaLibro.vue')
const RicercaLibriVicini = () => import('@/pages/RicercaLibriVicini.vue')
const CatalogoLibriMaster = () => import('@/pages/CatalogoLibriMaster.vue')
const LibroMaster = () => import('@/pages/AggiungiModificaLibroMaster.vue')



const routes = [
    //Home, la prima pagina
    {
        path: '/',
        component: Welcome,
        name: 'Home'
    },
    // pagina di login
    {
        path: '/login',
        component: Login,
        meta: { solo_ospiti: true }
    },
    //pagina di registrazione
    {
        path: '/registrati',
        component: Registrazione,
        meta: { solo_ospiti: true }
    },
    //pagina profilo utente
    {
        path: '/profilo',
        component: Profilo,
        name: 'Profilo',
        meta: { solo_autenticati: true },
    },
    //pagina relativa alla libreria dell'utente. E' un raccoglitore di scaffali (geolocalizzati) che l'utente può possedere.
    {
        path: '/libreria',
        component: Libreria,
        name: 'Libreria',
        meta: { solo_autenticati: true },
    },
    //Pagina per la creazione di un nuovo scaffale
    {
        path: '/libreria/scaffale/nuovo',
        component: AggiungiModificaScaffale,
        name: 'AggiungiScaffale',
        meta: { solo_autenticati: true },
    },
    //Pagina per la modifica di uno scaffale esistente
    {
        path: '/libreria/scaffale/modifica/:id',
        component: AggiungiModificaScaffale,
        name: 'ModificaScaffale',
        meta: { solo_autenticati: true },
    },
    //Pagina per i dettagli di uno scaffale esistente
    {
        path: '/libreria/scaffale/dettaglio/:id',
        component: DettaglioScaffale,
        name: 'DettaglioScaffale',
        meta: { solo_autenticati: true },
    },
    //Pagina dedicata alla creazione di un libro
    {
      path: '/libro/nuovo',
      component: AggiungiModificaLibro,
      name: 'AggiungiLibro',
      meta: { requiresAuth: true },
    },
    //Pagina dedicata alla modifica di un libro esistente
    {
      path: '/libro/modifica/:id',
      component: AggiungiModificaLibro,
      name: 'ModificaLibro',
      meta: { requiresAuth: true },
    },
    //Pagina dedicata alla ricerca geoloc. di un libro
    {
      path: '/libro/ricerca',
      component: RicercaLibriVicini,
      name: 'RicercaLibriVicini',
      meta: { requiresAuth: true },
    },
    {
    path: '/catalogo',
    component: CatalogoLibriMaster,
    name: 'CatalogoLibriMaster',
    meta: { requiresAuth: true }
  },
  {
    path: '/catalogo/LibroMaster/nuovo',
    component: LibroMaster,
    name: 'CreaLibroMaster',
    meta: { requiresAuth: true },

  },
  {
    path: '/catalogo/libroMaster/:id',
    component: LibroMaster,
    name: 'ModificaLibroMaster',
    meta: { requiresAuth: true },
  },

    //pagina dedicata agli admin per modifica di un profilo 
    {
        path: '/supervisione/ModificaProfilo/:id',
        component: Profilo,
        name: 'AdminProfilo',
        meta: { solo_autenticati: true,
                solo_admin: true
            }
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

//Protezione Router
// importante per avere sempre i dati utente senza richiamarli da altre parti del codice anche dopo refresh
router.beforeEach(async (to, from, next) => {
  const utenti_store = useUtentiStore()


  // Chiamo il server SOLO se c'è il token nel localStorage 
  // e non ho ancora i dati in Pinia
  const token_esistente = !!localStorage.getItem('csrf_token')

  // Se lo user non è stato ancora recuperato (es. dopo refresh), lo recupera
 if (utenti_store.utente === null && token_esistente) {
    try {
      // Se fallisce (es. 401), l'errore viene catturato qui e non blocca il router
      await utenti_store.getUtente()
    } catch (err) {
      console.warn("Sessione non valida o scaduta")
      // Non facciamo nulla: utenti_store.utente rimarrà null
    }
  }

  const is_autenticato = !!utenti_store.utente

  if (to.meta.solo_autenticati && !is_autenticato) {
    // Utente non autenticato viene reindirizzato a login
    return next('/login')
  }

  if (to.meta.solo_ospiti && is_autenticato) {
    // Utente già loggato niente accesso a login/registrazione, mando alla home
    return next('/')
  }

  if (to.meta.solo_admin) {
    const is_admin = utenti_store.utente?.ruolo === 'admin'
    if (is_admin) {
      return next() // Utente autorizzato, esce qui
    } else {
      return next({ name: 'Home' }) // Non autorizzato, esce qui
    }
  }
  next() // procede normalmente
})


export default router
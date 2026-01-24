<template>
    <!-- header principale della barra di navigazione -->
    <n-layout-header class="navbar_intestazione" bordered>

        <!-- contenitore interno per allineare logo e menu -->
        <div class="navbar_contenitore">

            <!-- il logo funge anche da link alla homepage -->
            <div class="logo_navigazione">
                <img class="immagine_logo" src="/logo_trasparente.png" alt="GeoBookSharing logo"
                    @click="router.push('/')">
            </div>

            <!-- visibile solo su schermi medio-grandi -->
            <n-space class="collegamenti_desktop" size="large" align="center">

                <!-- generazione dinamica dei link di navigazione -->
                <n-button v-for="link in links" :key="link.to" text :class="{ active: isLinkAttivo(link.to) }"
                    @click="gestioneLink(link.to)">
                    {{ link.label }}
                </n-button>
            </n-space>

            <!--modalità hamburger per mobile-->
            <div class="versione_mobile">

                <!-- bottone hamburger visibile solo su mobile -->
                <n-button quaternary circle @click="show_menu = true">

                    <!-- icona SVG inline per evitare dipendenze esterne -->
                    <n-icon size="24">
                        <template #default>
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z">
                                </path>
                            </svg>
                        </template>
                    </n-icon>
                </n-button>
            </div>
        </div>

        <!-- menu laterale che si apre da destra su dispositivi mobili -->
        <n-drawer v-model:show="show_menu" placement="right" width="200" :z-index="3000" :style="{
            top: '4rem',
            height: 'calc(100vh - 14rem)'
        }" :mask-style="{ top: '4rem' }">
            <n-drawer-content title="Menu" closable class="contenitore_menu">

                <!-- spazio verticale per i pulsanti del menu -->
                <n-space vertical size="large" class="space_menu_mobile">

                    <!-- stessi link del desktop -->
                    <n-button class="pulsanti_menu_mobile" v-for="link in links" :key="link.to" text
                        @click="gestioneLink(link.to)">
                        {{ link.label }}
                    </n-button>
                </n-space>
            </n-drawer-content>
        </n-drawer>
    </n-layout-header>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUtentiStore } from '@/stores/utentiStore';
import { useMessage } from 'naive-ui'


const router = useRouter() // per spostarsi tra le pagine
const route = useRoute()    //per leggere informazioni sulla pagina attuale
const utenti_store = useUtentiStore() //per recuperare informazioni dallo store utenti
const message = useMessage()

const show_menu = ref(false) //Stato per l'apertura/chiusura del menu mobile

//Qui si decide cosa verrà visualizato. Se sei loggato mostra i link dedicati, altrimenti solo login e registrati.
const links = computed(() => {
    //menu per utenti non autenticati
    if(!utenti_store.utente) {
        return [
                { label: 'Home', to: '/' },
                { label: 'Login', to: '/login' },
                { label: 'Registrati', to: '/registrati' },
                ]
    }
    //menu base per tutti gli utenti loggati ()
    const menu_loggato = [
            { label: 'Home', to: '/' },
            { label: 'Profilo', to: '/profilo' },
            { label: 'Libreria', to: '/' },
            { label: 'Cerca Libri', to: '/' },
            { label: 'Catalogo', to: '/' },
            { label: 'Condivisioni', to: '/' }            
        ]
        
    //aggiunge link solo se admin
    if (utenti_store.utente.ruolo === 'admin') {
        menu_loggato.push({ label: 'Supervisore', to: '/' })
    }

    //inserimento dinamico di logout in fondo al menu
    menu_loggato.push({ label: 'logout', to: '/logout' },)

    return menu_loggato
})

//Serve per mettere una formattzione particola ai link che fa capire dove ti trovi.
function isLinkAttivo(path) {
    if (path === '/') {
        // Se il link è la Home deve essere attivo SOLO se il path è esattamente '/'
        return route.path === '/';
    }
    // Per gli altri link, controlo se il path inizia con la rotta del link
    return route.path.startsWith(path);
}


async function gestioneLink(path) {

     if (path === '/logout') {
        router.push('/')
        await utenti_store.logout()
        message.success('Logout effettuato con successo!')
        return
    }
    router.push(path)
    show_menu.value = false // Chiudo il menu mobile se era aperto

}
</script>


<style scoped>
.navbar_intestazione {
   /* la barra rimane ancorata in alto anche durante scorrimento */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    /*z-index molto alto, rimane sopra mappe, card e modali */
    z-index: 2010; 
    
    /* altezza fissa e padding dinamico con clamp() per adattarsi agli schermi */
    height: 4rem; /* Altezza definita */
    padding: 0 clamp(1rem, 3vw, 2rem) !important;
    background-color: var(--dark_gray, #5c5b5be0);
    box-shadow: var(--box-shadow);

    /* effetto sfocatura del contenuto che scorre dietro la navbar */
    backdrop-filter: blur(0.5rem); 
    -webkit-backdrop-filter: blur(0.5rem);
    transition: background-color var(--transition-speed);
}

.navbar_contenitore {
    color: var(--text-color-light);
    display: flex;
    justify-content: space-between; /* spinge il logo a sinistra e i link a destra */
    align-items: center;
    height: 100%; /* Altezza fissa per la barra di navigazione */
    max-width: var(--container-max-width);
    margin: 0 auto;
}

.logo_navigazione {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: opacity var(--transition-speed);
}

.space_menu_mobile {
    height: min-content;
    padding-top: 1rem;
}

.logo_navigazione:hover {
    opacity: 0.8;
}

.immagine_logo {
    height: 2.5rem;
    object-fit: contain;
}

/* Modalità Desktop */
.collegamenti_desktop {
    display: flex;
}

.collegamenti_desktop :deep(.n-button) {
    color: var(--text-color-light);
    font-size: 0.9rem;
    transition: color var(--transition-speed);
}

.collegamenti_desktop :deep(.n-button:hover) {
    color: var(--navbar-text-hover) !important;
}

.collegamenti_desktop :deep(.n-button.active) {
    font-weight: 700;
    color: var(--text-color-light);
    /* Una linea sottile sotto il link attivo */
    border-bottom: 0.125rem solid var(--navbar-text-hover);
    border-radius: 0;
}

/* Modalità Hamburger (Mobile) */
.versione_mobile {
    display: none;
}

.versione_mobile :deep(.n-button) {
    color: var(--text-color-light);
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {


    .collegamenti_desktop {
        display: none !important;
    }
    
    .versione_mobile {
        display: block;
    }

    /* Gestione link dentro il Drawer (Menu Mobile) */
    .pulsanti_menu_mobile {
        width: 100%;
        justify-content: flex-start !important; /* Allinea il testo a sinistra */
        padding: 0.75rem 1rem !important;
        font-size: 1.1rem !important;
        color: var(--color-text-dark) !important;
    }
}

</style>
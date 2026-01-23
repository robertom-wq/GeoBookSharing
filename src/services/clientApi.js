// questa utility semplifica e standardizza tutte le chiamate API verso il backend

//estraggo il token CSRF dai cookie del browser
function getCsrfToken() {
    //Provo dal LocalStorage
    const local = localStorage.getItem('csrf_token')
    if (local) {
        return local
    }
    // come fallback provo dai Cookie (se non sono HttpOnly)
    const match = document.cookie.match(/csrf_token=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
}


export async function chiamaAPI(path, { method = 'GET', body } = {}) {

    //Controllo se il body è un'instanza di FormData
    //Stabilisco se sto mandando dati semplici in JSON o come file/immagini FormData
    const is_form_data = body instanceof FormData
    const headers = {}

    // Se non sto mandando un form con immagini, dico al server che gli sto inviando un JSON standard
    if (!is_form_data) {
        headers['Content-Type'] = 'application/json'
    }

    //GESTIONE SICUREZZA CSRF
    //Per ogni chiamata POST, PATCH, DELETE prendo il token e lo inserisco negli header. 
    const csrf = getCsrfToken()
    if (csrf && method !== 'GET') {
        //se il controllo passa, prendo il token e lo aggiungo tra gli headers della richiesta
        headers['x-csrf-token'] = csrf

    }

    //costruisco ed eseguo la chiamata fetch al backend
    const risposta = await fetch(import.meta.env.VITE_API_URL + path, {
        method,
        credentials: 'include', // Importante per inviare cookie (JWT e CSRF) al server
        headers,
        // Se è un form lo mando così com'è, altrimenti trasformo l'oggetto in una stringa JSON
        body: is_form_data ? body : body ? JSON.stringify(body) : undefined,
    });

    //Gestione errori
   if (!risposta.ok) {
        let messaggio = 'Errore nella richiesta'
        try {
            // Provo a leggere il JSON dell'errore
            const body_errore = await risposta.json()
            messaggio = body_errore.error || messaggio
        } catch (e) {
            // Se non è un JSON, uso il testo dello status
            messaggio = `Errore ${risposta.status}: ${risposta.statusText}`
        }
        throw new Error(messaggio)
    }

    // Se lo status è 204 non provo a fare il parse del JSON
    if (risposta.status === 204) {
        return null 
    }

    return risposta.json()
}

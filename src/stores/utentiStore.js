// Questo è lo store relativo agli utenti: qui dentro salvo tutto quello che riguarda 
// chi sta usando l'applicazione. Se è loggato, i suoi dati, se sta caricando qualcosa ecc.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chiamaAPI } from '@/services/clientApi'

//'utente' rappresenta l'ID univoco del tuo store all'interno di Pinia
export const useUtentiStore = defineStore('utente', () => {

    // STATI // 
    const utente = ref(null) // salvo i dati dell'utente loggato tipo nome, email, ecc
    const csrf_token = ref(localStorage.getItem('csrf_token') || null) //salvo il token per le chiamate API (UPDATE/DELETE/POST)
    const loading = ref(false)
    const risultati_ricerca = ref([]) //Qui memorizzo i risultati quando cerco altri utenti
    const utente_selezionato = ref(null)
    const nr_totale_utenti = ref(0)
    const nr_pagine_totali = ref(0)
    const nr_pagina_corrente = ref(1)

    // AZIONI // 

    // eseguo login
    async function login(username, password) {
        loading.value = true

        try {
            const risposta_login = await chiamaAPI("/auth/login", {
                method: 'POST',
                body: { username, password }
            })

            // Se il server risponde OK, salvo i dati che mi ha mandato
            utente.value = risposta_login.utente
            csrf_token.value = risposta_login.csrf_token  // prendo csrf_token: ... dalla risposta
            localStorage.setItem('csrf_token', risposta_login.csrf_token)
        } catch (err) {
            // Se c'è un errore tipo password sbagliata, resetto l'utente, cancello il token e loggo l'errore
            utente.value = null
            localStorage.removeItem('csrf_token')
            console.error('Impossibile completare il Login', err)
            throw err
        } finally {
            loading.value = false // Fine caricamento, in ogni caso
        }
    }

    // richiedo dati del profilo utente loggato
    async function getUtente() {
        loading.value = true
        try {
            const risposta = await chiamaAPI('/utenti/profilo', {
                method: 'GET',
            })
            // Prendo i dati del profilo e li metto nello stato
            utente.value = risposta.utente
            return risposta
        } catch (err) {
            utente.value = null
            localStorage.removeItem('csrf_token')
            console.error("Impossibile recuperare il profilo corrente", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // richiedo dati del profilo utente loggato
    async function getUtenteByID(id) {
        loading.value = true
        const id_utente = parseInt(id)
        try {
            const risposta = await chiamaAPI(`/utenti/profilo/${id_utente}`, {
                method: 'GET',
            })
            // Prendo i dati del profilo e li metto nello stato
            utente_selezionato.value = risposta.utente
            return risposta
        } catch (err) {
            utente_selezionato.value = null
            console.error("Impossibile recuperare il profilo selezionato", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Eseguo registrazione (crazione nuovo accoubnt)
    async function registrati(form_data) {
        loading.value = true
        console.log(form_data)
        try {
            // Faccio la POST con tutti i dati del nuovo utente
            const nuovo_utente = await chiamaAPI('/auth/registrazione', {
                method: 'POST',
                body: form_data
            })
            return nuovo_utente
        } catch (err) {
            console.error('Errore nella registrazione', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // restituisce tutti gli utenti (utile per admin)
    async function getAllUtenti(parametri = {}) {
        loading.value = true

        try {
            // Estraggo i valori dall'oggetto parametri
            const {
                q,
                pagina = 1,
                limit = 10,
                bannato,
                richiesta_eliminazione
            } = parametri

            // Costruisco la query string dinamicamente
            // URLSearchParams gestisce automaticamente la codifica dei caratteri speciali
            const query = new URLSearchParams()
            query.append('pagina', pagina)
            query.append('limit', limit)

            if (q) {
                query.append('q', q)
            }

            // Invo i booleani solo se non sono null o undefined
            if (bannato !== null && bannato !== undefined) {
                query.append('bannato', bannato)
            }
            if (richiesta_eliminazione !== null && richiesta_eliminazione !== undefined) {
                query.append('richiesta_eliminazione', richiesta_eliminazione)
            }

            // Chiamata API con i parametri
            const risposta = await chiamaAPI(`/utenti/all?${query.toString()}`, {
                method: 'GET'
            })

            // Salviamo i dati negli stati dello store
            risultati_ricerca.value = risposta.data
            nr_totale_utenti.value = risposta.conteggioTotale
            nr_pagine_totali.value = risposta.nr_pagine_totali
            nr_pagina_corrente.value = risposta.nr_pagina_corrente

            return risposta
        } catch (err) {
            console.error("Errore nel recupero della lista utenti", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Richiesta di eliminazione da parte di un utente
    async function softDeleteUtente(valore) {
        loading.value = true
        try {
            const new_data_richiesta = new Date().toISOString()
            const utente_con_richiesta_delete = chiamaAPI('/utenti/richiestaCancellazione', {
                method: 'PATCH',
                // Passo un oggetto semplice 
                body: {
                    richiesta_eliminazione: valore,
                    data_richiesta_eliminazione: valore ? (utente.value.data_richiesta_eliminazione || new_data_richiesta) : null
                }
            });
            Object.assign(utente, utente_con_richiesta_delete.data)
            return utente_con_richiesta_delete
        } catch (err) {
            console.err("Impossibile procedere con il softDelete", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // update profilo utente
    async function updateUtente(id = null, data, is_admin_mode = false) {
        // un amministratore può modificare alcuni parametri dell'utente, in tal caso nella richiesta deve
        //essere specificato l'ID dell'utente da modificare
        if (is_admin_mode && !id) {
            console.error("Errore: ID mancante in modalità amministratore.");
            return;
        }
        loading.value = true
        const path = is_admin_mode
            ? `/utenti/profilo/${id}`
            : `/utenti/profilo`

        try {
            const aggiornato = await chiamaAPI(path, {
                method: 'PATCH',
                body: data,
            })

            if (is_admin_mode) {
                Object.assign(utente_selezionato, aggiornato.data)
            } else {
                Object.assign(utente, aggiornato.data)
            }
            return aggiornato
        } catch (err) {
            console.error("Impossibile affiornare utente", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Eliminazione utente definitiva (nel backend è previsto controllo autorizzazione. solo admin può procedere)
    async function deleteUtente(id) {
        loading.value = true
        try {
            const cancellato = await chiamaAPI(`/utenti/profilo/${id}`, {
                method: 'DELETE'
            })
        } catch (err) {
            console.error("Impossibile eliminare utente", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Eseguo logout
    async function logout() {
        try {
            // Chiamo l'API di logout (con il token di sicurezza)
            await chiamaAPI('/auth/logout', { method: 'POST' })
            //console.log('Logout eseguito')
        } catch (err) {
            console.warn('Logout fallito', err)
            throw err
        } finally {
            // Pulisco tutto, utente, token e svuoto il localStorage
            utente.value = null
            csrf_token.value = null
            localStorage.removeItem('csrf_token')
        }
    }

    return {
        //STATI
        utente,
        csrf_token,
        loading,
        risultati_ricerca,
        utente_selezionato,
        nr_totale_utenti,
        nr_pagine_totali,
        nr_pagina_corrente,

        //AZIONI
        login,
        logout,
        registrati,
        getUtente,
        getUtenteByID,
        getAllUtenti,
        deleteUtente,
        softDeleteUtente,
        updateUtente

    }
})

import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { chiamaAPI } from '@/services/clientApi'

export const useValutazioniStore = defineStore('valutazioni', () => {

    //stati
    const loading = ref(false)
    const mie_alutazioni_ricevute = ref([])
    const mie_valutazioni_inviate = ref([])
    const ranking_utente_selezionato = ref(null)
    const ranking_utenti = ref({}) // { id_utente : voto} raccoglie tutte le valutazioni degli utenti con cui interagisco

    // calcolo combinato di tutte le valutazioni (inviate/ricevute)
    const mie_valutazioni_all = computed(() => {
        return [...mie_valutazioni_inviate.value, ...mie_alutazioni_ricevute.value]
    })

    //Azioni

    // Questafunzione permette di avere una cache di utenti con le valutazione, utile nella pagina di
    // gestione delle condivisioni dove ho bisogno di avere le votazioni di piu utenti o anche dello stesso utente piu volte
    // in modo SILENZIOSO SENZ LOADING
    async function getRankingUtenti(id) {
            // Se ho già i dati di questo utente, non carico nulla
            if (ranking_utenti.value[id]) {
                return ranking_utenti.value[id]
            }

            // Se non ci sono dati, effettuo la chiamata
            try {
                const valutazione = await chiamaAPI(`/valutazioni/valutazioniRecenti/${id}`)
                // salvo nell'oggetto usando l'ID come chiave
                ranking_utenti.value[id] = valutazione.data
                return valutazione.data
            } catch (err) {
                console.error(`Errore cache per utente ${id}`, err)
                // salvo un valore di default per evitare chiamate infinite in caso di errore
                ranking_utenti.value[id] = { media_voto: 0, totale_recensioni: 0 }
            }
        }

    //recupero ranking medio di un utente tramite id (con LOADING)
    async function getRankingUtenteByID(id) {
        loading.value = true
        
        try {
            const valutazione = await chiamaAPI(`/valutazioni/valutazioniRecenti/${id}`)
            ranking_utente_selezionato.value = valutazione.data
            ranking_utenti.value[id] = valutazione.data
            return valutazione
        } catch (err) {
            console.error("Impossibile recuperare la valutazione richiesta", err)
            throw err            
        } finally {
            loading.value = false
        }
    }

    // creazione di una nuova valutazione per una transazione conclusa
    async function creaValutazioneUtente(data) {
        loading.value = true
        
        try {
            const valutazione = await chiamaAPI(`/valutazioni/nuova`,{
                method: 'POST',
                body: data
            })

            // aggiorno l'array delle mie valutazioni inviate
            mie_valutazioni_inviate.value.push(valutazione.data) 
            return valutazione
        } catch (err) {
            console.error("Impossibile creare la valutazione richiesta", err)
            throw err            
        } finally {
            loading.value = false
        }
    }
    
    // recupero feedback inviati e ricevuti da utente loggato
    async function getMieValutazioni() {
        loading.value = true
        try {
            // eseguo contemporaneamente le due richieste per le condivisioni da richiedente e da proprietario
            //è prevista paginazione ma per praticita ho impostato solo il limit a 100 risultati per pagina
            const [recensore, recensito] = await Promise.all([
                chiamaAPI('/valutazioni/mieValutazioni?ruolo=recensore&limit=100'),
                chiamaAPI('/valutazioni/mieValutazioni?ruolo=recensito&limit=100')
            ])
            mie_valutazioni_inviate.value = recensore.data || []
            mie_alutazioni_ricevute.value = recensito.data || []
        } catch (err) {
            console.error("Impossibile recuperare le mie valutazioni", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        mie_alutazioni_ricevute,
        mie_valutazioni_inviate,
        ranking_utente_selezionato,
        mie_valutazioni_all,
        ranking_utenti,

        getRankingUtenteByID,
        creaValutazioneUtente,
        getMieValutazioni,
        getRankingUtenti


    }
})
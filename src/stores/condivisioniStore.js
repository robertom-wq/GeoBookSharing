import { defineStore } from "pinia"
import { ref } from "vue"
import { chiamaAPI } from '@/services/clientApi'

export const useCondivisioniStore = defineStore('condivisioni', () => {

    //stati
    const loading = ref(false)
    const mie_condivisioni_richiedente = ref([])
    const mie_condivisioni_proprietario = ref([])

    //azioni
    // recupero delle condivisioni per entrambi i ruoli
    async function getMieCondivisioni() {
        loading.value = true
        try {
            // eseguo contemporaneamente le due richieste per le condivisioni da richiedente e da proprietario
            //è prevista paginazione ma per ora imposto solo il limit a 100 risultati per pagina
            const [c_richiedente, c_proprietario] = await Promise.all([
                chiamaAPI('/condivisioni/getMieCondivisioni?ruolo=richiedente&limit=100'),
                chiamaAPI('/condivisioni/getMieCondivisioni?ruolo=proprietario&limit=100')
            ])
            mie_condivisioni_richiedente.value = c_richiedente.data || []
            mie_condivisioni_proprietario.value = c_proprietario.data || []

            console.log("Proprietario",mie_condivisioni_proprietario.value )
            console.log("Richiedente",mie_condivisioni_richiedente.value )

        } catch (err) {
            console.error("Impossibile recuperare le mie richieste di condivisione come richiedente", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    //invio di una nuova richiesta di condivisione
    async function createRichiestaCondivisione(data) {
        loading.value = true

        try {
            const nuova_richiesta = await chiamaAPI('/condivisioni/nuova', {
                method: 'POST',
                body: data
            })

            mie_condivisioni_richiedente.value.push(nuova_richiesta.data)
            return nuova_richiesta

        } catch (err) {
            console.error("Impossibile creare la condivisione richiesta", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // gestione dei cambi di stato accettazione o rifiuto
    async function aggiornaStatoCondivisione(data) {
        //data es {id: 10, azione: 'accetta', note:'test'}
        loading.value = true
        const { id, ...parametri } = data //scorporo id dai dati necessari nel body
        console.log('data',data)
        try {
            const condivisione_aggiornata = await chiamaAPI(`/condivisioni/${id}/stato`, {
                method: 'PATCH',
                body: parametri
            })
            //cerco la modificata condivisione nell'array
            const elemento = mie_condivisioni_proprietario.value.find(elemento_array => elemento_array.id === id)
            if (elemento && condivisione_aggiornata.data) {
                // Object.assign aggiorna le proprietà dell'oggetto esistente
                Object.assign(elemento, condivisione_aggiornata.data)
            }
            return condivisione_aggiornata


        } catch (err) {
            console.error("Impossibile aggiornare la condivisione ", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    //registrazione fine prestito
    async function concludiPrestito(id) {
        loading.value = true
        try {
            const conclusa = await chiamaAPI(`/condivisioni/${id}/concludi`, {
                method: 'PATCH'
            })

            const elemento = mie_condivisioni_proprietario.value.find(elemento_array => elemento_array.id === id)
            if (elemento && conclusa.data) {
                // Object.assign aggiorna le proprietà dell'oggetto esistente
                Object.assign(elemento, conclusa.data)
            }
            return conclusa

        } catch (err) {
            console.error("Impossibile concludere la condivisione richiesta", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    //eliminazione di una condivisione
    async function deleteCondivisione(id, motivo) {
        loading.value = true
        try {
            const eliminata = await chiamaAPI(`/condivisioni/${id}/delete`, {
                method: 'DELETE',
                body: { motivo}
            })

            //rimuovo la condivisione da entrambe le liste
            mie_condivisioni_richiedente.value = mie_condivisioni_richiedente.value.filter(elemento => elemento.id !== id)
            mie_condivisioni_proprietario.value = mie_condivisioni_proprietario.value.filter(elemento => elemento.id !== id)
        } catch (err) {
            console.error("Impossibile eliminare la condivisione richiesta", err)
            throw err
        } finally {
            loading.value = false
        }
    }
    return {
        loading,
        mie_condivisioni_richiedente,
        mie_condivisioni_proprietario,

        getMieCondivisioni,
        createRichiestaCondivisione,
        aggiornaStatoCondivisione,
        concludiPrestito,
        deleteCondivisione

    }
})
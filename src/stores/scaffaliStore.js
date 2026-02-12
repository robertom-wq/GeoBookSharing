import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chiamaAPI } from '@/services/clientApi'
import { parsePosizione } from '@/utils/toolkit'

//'scaffali' rappresenta l'ID univoco del tuo store all'interno di Pinia
export const useScaffaliStore = defineStore('scaffali', () => {

    // STATI 
    const scaffali_utente = ref([])//lista scaffali dell'utente loggato  
    const scaffale_selezionato = ref(null)//scaffale che l'utente sta visualizzando
    const loading = ref(false)
    
    const conteggio_scaffali_totali = computed(() => scaffali_utente.value?.length || 0) //variabile calcolata che mi dice quanti scaffali ho in lista

    // AZIONI 
    // carico gli scaffali dell'utente loggato
    async function getMieiScaffali() {
        loading.value = true
        try {
            const scaffali = await chiamaAPI('/scaffali/mieiScaffali')

            // Il database manda la posizione in un formato e uso map per girarli tutti e trasformarli in un formato con lat e lng leggibili.
            const dati_scomposti = scaffali.data.map(scaffale => {

                //parsePosizione è una funzione creata per estrarre lat/lng da formato formato WKT tipo POINT(lng lat) restituisce un oggetto da usare con Leaflet
                const coordinate = parsePosizione(scaffale.posizione) 
                return {
                    ...scaffale, // tengo i dati originali (nome, id...)
                    lat: coordinate.lat, // aggiungo la latitudine
                    lng: coordinate.lng // aggiungo la longitudine
                }
            })
            // Salvo la lista pulita nello store
            scaffali_utente.value = dati_scomposti

        } catch (err) {
            console.error('Errore durante il caricamento degli scaffali utente', err)
            scaffali_utente.value = []
            throw err
        } finally {
            loading.value = false
        }

    }

    //crea un nuovo scaffale e lo aggiunge subito alla lista senza ricaricare tutto
    async function createScaffale(dati_scaffale) {
        //console.log('Creo scaffale')
        loading.value = true
        try {
            const scaffale = await chiamaAPI('/scaffali', {
                method: 'POST',
                body: dati_scaffale,                
            })
            const nuovo_scaffale = scaffale.data

            // Invece di richiamare getMieiScaffali per avere la lista completa ogni volta, lo aggiungo manualmente alla lista locale
            scaffali_utente.value.push(nuovo_scaffale)

            return nuovo_scaffale

        } catch (err) {
            console.error('Errore durante la creazione dello scaffale', err)
            throw err
        } finally {
            loading.value = false
        }

    }

    // modifica i dati di uno scaffale esistente
    async function updateScaffale(scaffale_id, dati_scaffale) {
        loading.value = true
        try {
            const scaffale = await chiamaAPI(`/scaffali/${scaffale_id}`, {
                method: 'PATCH',
                body: dati_scaffale,                
            })

            const scaffale_aggiornato = scaffale.data
            
            if (scaffale_selezionato.value) {
                // Se c'è già qualcosa (non è null), facciamo il merge dei dati
                Object.assign(scaffale_selezionato.value, scaffale_aggiornato)
            } else {
                // Se è null, dobbiamo per forza assegnare l'oggetto intero
                scaffale_selezionato.value = scaffale_aggiornato
            }
            return scaffale

        } catch (err) {
            console.error("Errore durante l'aggiornamento dello scaffale", err)
            throw err
        } finally {
            loading.value = false
        }

    }

    //Elimino scaffale dal server e dalla lista locale
    async function deleteScaffale(scaffale_id) {
        loading.value = true

        try {
            await chiamaAPI(`/scaffali/${scaffale_id}`, {
                method: 'DELETE',                
            })

            //tengo tutti gli scaffali TRANNE quello che ho appena eliminato filtrando tutti quelli con id diverso da quello eliminato
            scaffali_utente.value = scaffali_utente.value.filter(s => s.id !== scaffale_id)

        } catch (err) {
            console.error('Errore nella rimozione dello scaffale', err)
            throw err
        } finally {
            loading.value = false
        }

    }

    // carica uno scaffale per la pagina di dettaglio
    async function getScaffaleById(id) {
        scaffale_selezionato.value = null; // Pulisce lo stato precedente
        try {
            const scaffale = await chiamaAPI(`/scaffali/${id}`);
            // come sopra rendo le coordinate usabili per la mappa
            const coordinate = parsePosizione(scaffale.data.posizione);
            const scaffale_parsificato = {
                ...scaffale,
                lat: coordinate.lat,
                lng: coordinate.lng
            };

            // 3. Salva nello stato reattivo e restituisce
            scaffale_selezionato.value = scaffale_parsificato;
            console.log("Scaffale parsificato", scaffale_parsificato)
            return scaffale_parsificato;

        } catch (err) {
            console.error(`Errore durante il caricamento dello scaffale ${id}:`, err);
            // Non lanciare l'errore, ma ritorna null o gestisci il fallimento
            throw err;
        }
    }


    // Esporto tutto per usarlo nei componenti
    return {
        //STATI//
        scaffali_utente,
        scaffale_selezionato,
        loading,
        conteggio_scaffali_totali,

        //AZIONI//
        getMieiScaffali,
        createScaffale,
        deleteScaffale,
        getScaffaleById,
        updateScaffale
    }
})


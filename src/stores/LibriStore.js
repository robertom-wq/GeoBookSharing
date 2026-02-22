import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { chiamaAPI } from "@/services/clientApi"
import { useUtentiStore } from "@/stores/utentiStore"
import { parsePosizione } from "@/utils/toolkit"

export const useLibriStore = defineStore('libri', () => {

    const utenti_store = useUtentiStore()

    //STATI
    const loading = ref(false)
    const loading_eliminazione = ref(false)
    const miei_libri = ref([])
    const libri_all = ref([]) // Libri trovati nelle ricerche
    const libro_selezionato_dettagli = ref(null) // Il libro che sto consultando in dettaglio
    const generi_letterari = ref([]) // Lista dei generi
    const tipi_condivisione = ref([]) // Lista dei tipi di condivisione


    //AZIONI

    //creazione manuale di un libro caricando anche l'immagine della copertina
    async function createLibro(libro, fileCopertina) {
        loading.value = true

        try {
            if (fileCopertina) {
                //se esiste il file di copertina, lo aggiungo (assieme al tipo) all'oggetto formData esistente
                //uso formData (oggetto 'libro') perché con i file non basta il JSON
                libro.append('file', fileCopertina)
                libro.append('type', 'copertina')
            }


            //effettuo la chiamata al backend per la creazione di un nuovo libro
            const nuovo_libro = await chiamaAPI('/libri', {
                method: 'POST',
                body: libro,                
            })

            // aggiorno lo stato aggiungendo il nuovo libro ai miei libri
            miei_libri.value.push(nuovo_libro.data)

            return nuovo_libro

        } catch (err) {
            console.error("Errore durante la creazione del libro", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    //recupero libri personali
    async function getMieiLibri() {
        loading.value = true

        try {
            //effettuo la chiamata al backend per ricevere i miei libri
            const libri = await chiamaAPI('/libri/mieiLibri')
            miei_libri.value = libri.data
        } catch (err) {
            console.error('Errore durante il caricamento dei libri', err)
            miei_libri.value = []
            throw err
        } finally {
            loading.value = false
        }

    }

    //aggoirnamento di un libro tramite id
    async function updateLibro(libro_id, libro, nuovoFileCopertina) {
        //console.log("Libro anno", typeof(libro.get('anno')))
        loading.value = true
        try {
            // verifico la presenza della nuova copertina e ne inserisco i dati nel formData
            if (nuovoFileCopertina) {
                libro.append('file', nuovoFileCopertina)
                libro.append('type', 'copertina')
            }

            //effettuo la chiamata al backend per aggiornare il libro
            const libro_aggiornato = await chiamaAPI(`/libri/${libro_id}`, {
                method: 'PATCH',
                body: libro,
                })

            // Se ci sono già i dettagli caricati, faccio il merge per non perdere nulla
            if (libro_selezionato_dettagli.value) {
                Object.assign(libro_selezionato_dettagli.value, libro_aggiornato.data)
            } else {
                // Se per qualche motivo era null, lo inizializzo ora
                libro_selezionato_dettagli.value = libro_aggiornato.data
            }

            return libro_aggiornato

        } catch (err) {
            console.error("Errore durante l'aggionamento del libro", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    //Eliminazione di un libro
    async function deleteLibro(libro_id) {
        loading_eliminazione.value = true

        try {
            await chiamaAPI(`/libri/${libro_id}`, {
                method: 'DELETE',                
            })

            // AGgiorno lo stato filtrando via l'elemento
            miei_libri.value = miei_libri.value.filter(l => l.id !== libro_id)
            libri_all.value = libri_all.value.filter(l => l.id !== libro_id)
            return true

        } catch (err) {
            console.error('Impossibile eliminare libro', err)
            throw err
        } finally {
            loading_eliminazione.value = false
        }
    }


    // consultazione dettagli di un libro tramite id
    async function getLibroByID(libro_id) {
        loading.value = true

        try {
            const libro = await chiamaAPI(`/libri/${libro_id}`)
            libro_selezionato_dettagli.value = libro.data
            return libro

        } catch (err) {
            console.error("Impossibile caricare i dati del libro selezionato", err)
            throw err
        } finally {
            loading.value = false
        }
    }


    // restituisce la lista dei libri vicini in base ai parametri passati
    async function getLibriVicini(dati) {
        loading.value = true

        try {
            // Preparo i pezzi del link (URL Params) tipo ?lat=45&lng=9...
            const parametri = new URLSearchParams()
            parametri.append('lat', dati.lat)
            parametri.append('lng', dati.lng)

            //aggiungo altri parametri opzionali
            if (dati.dist) {
                parametri.append('dist', dati.dist)
            }
            if (dati.q) {
                parametri.append('q', dati.q)
            }
            if (dati.limit) {
                parametri.append('limit', dati.limit)
            }
            //console.log(parametri.toString())
            const libri_vicini = await chiamaAPI(`/libri/libriVicini?${parametri.toString()}`)

            // Trasformo la posizione del DB in coordinate lat/lng pulite per la mappa
            const libri_vicini_parsificati = libri_vicini.data.map(libro => {
                const coordinate = parsePosizione(libro.posizione)
                return {
                    ...libro,
                    lat: coordinate.lat,
                    lng: coordinate.lng
                }
            })

            libri_all.value = libri_vicini_parsificati

            return libri_vicini

        } catch (err) {
            console.error("Impossibile visualizzare libri vicini", err)
            throw err
        } finally {
            loading.value = false
        }
    }


    //Crezione di un libro da modello Master
    async function createLibroDaMaster(libro) {
        loading.value = true
        //console.log(libro)

        try {
            const libro_da_master = await chiamaAPI('/libri/daMaster', {
                method: 'POST',
                body: libro,                
            })
            return libro_da_master

        } catch (err) {
            console.error("Impossibile creare libro dal master", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Recupera la lista dei generi letterari censiti
    async function getGeneriLetterari() {
        loading.value = true
        try {
            const generi = await chiamaAPI('/libri/generi')
            //console.log("GENERI",generi)
            generi_letterari.value = generi.data
            return generi
        } catch (err) {
            console.error("Impossibile recuperare la lista dei generi letterari", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Recupera la lista dei tipi di condivisione censiti
    async function getTipiCondivisione() {
        loading.value = true
        try {
            const tipi_condivisione_res = await chiamaAPI('/libri/tipiCondivisione')
            tipi_condivisione.value = tipi_condivisione_res.data
            return tipi_condivisione_res
        } catch (err) {
            console.error("Impossibile recuperare la lista dei tipi di condivisione", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Assicurati di importare chiamaAPI o axios a seconda del tuo setup
    async function getLibriTopVisitati() {
        loading.value = true
        try {
            const top_libri_visitati = await chiamaAPI('/libri/topVisitati', {
                method: 'GET'
            })
            //console.log("top libri",top_libri_visitati.data)
            return top_libri_visitati.data // Restituisce l'array dei 10 libri
        } catch (err) {
            console.error("Errore nel recupero statistiche libri", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetLibriVicini() {
        libri_all.value = []
    }

    //Controlla se il libro che sto guardando è mio, utile per mostrare o nascondere i tasti Modifica ed Elimina
    const sono_proprietario_libro = computed(() => {
        const utente_loggato = utenti_store.utente
        //console.log("UTENTE LOGGATO",utente_loggato)
        if (!utente_loggato) {
            return false
        }
        const libro = libro_selezionato_dettagli.value
        //console.log("LIBRO SELEZIONATO",libro)
        if (!libro) {
            return false
        }
        return libro.proprietario_id === utente_loggato.id
    })



    // Esporto tutto per l'uso nei componenti
    return {
        //STATI
        loading,
        miei_libri,
        libri_all,
        libro_selezionato_dettagli,
        generi_letterari,
        tipi_condivisione,

        sono_proprietario_libro,

        //AZIONI
        createLibro,
        getMieiLibri,
        updateLibro,
        deleteLibro,
        resetLibriVicini,
        getLibroByID,
        getLibriVicini,
        createLibroDaMaster,
        getGeneriLetterari,
        getTipiCondivisione,
        getLibriTopVisitati


    }

})
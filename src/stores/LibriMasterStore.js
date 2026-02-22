import { defineStore } from "pinia"
import { ref } from 'vue'
import { chiamaAPI } from "@/services/clientApi"

export const useLibriMasterStore = defineStore('libriMaster', ()=>{

    //STATI
    const catalogo_master = ref([])
    const libro_master_selezionato = ref(null)
    const loading = ref(false)
    const totale_libri_master = ref(0)

    //AZIONI
    //restituisce la lista dei libri master caricati a ssistema. se q è popolato allora esegue una ricerca altrimenti 
    //li restituisce tutti
    async function getLibriMaster(query='',pagina = 1, limit = 10) {
        loading.value = true

        try {
           // Costruisco l'URL con i parametri richiesti dal backend
            let url_richiesta = `/libriMaster?pagina=${pagina}&limit=${limit}`
            if (query) {
                url_richiesta += `&q=${encodeURIComponent(query)}`
            }

            const libri_master = await chiamaAPI(url_richiesta)
            catalogo_master.value = libri_master.data
            totale_libri_master.value = libri_master.conteggioTotale || 0
            return libri_master
            

        } catch (err) {
            console.error('Impossibile caricare il catalogo master!', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // recupera un singolo libro master tramite id
    async function getLibroMasterByID(id) {
        // svuoto lo stato di libro_master_selezionato per la nuova ricerca
        libro_master_selezionato.value = null
        loading.value = true

        try {
            const libro_master = await chiamaAPI(`/libriMaster/${id}`)
            libro_master_selezionato.value = libro_master.data
            return libro_master

        } catch (err) {
            console.error(`Impossibile caricare il libro master ${id}`,err)
            throw err
        } finally {
            loading.value= false
        }       
    }

    // crea nuovo libro master da codice isbn
    async function createLibroMasterISBN(isbn) {
        loading.value = true
        //console.log(isbn)

        try {
            const nuovo_libro_master = await chiamaAPI('/libriMaster/isbn',{
                method: 'POST',
                body: {isbn},                
            })

            //aggiorno lo store
            if (nuovo_libro_master && catalogo_master.value) {
                catalogo_master.value.push(nuovo_libro_master.data)
            }
            return nuovo_libro_master

        } catch (err) {
            console.error('Impossibile creare il libro master tramite ISBN', err)
            throw err
        } finally {
            loading.value = false
        }
        
    }

    // creazione manuale libro master con copertina
    async function createLibroMaster(libro, copertina=null) {
        //libro è un oggetto formData
        loading.value = true

        try {
            if(copertina) {
                libro.append('file', copertina)
                libro.append('type','copertina')
            }
            const nuovo_libro_master = await chiamaAPI('/libriMaster', {
                method: 'POST',
                body: libro
            })

            if (nuovo_libro_master && catalogo_master.value) {
                catalogo_master.value.push(nuovo_libro_master.data)
            }
            return nuovo_libro_master
            
        } catch (err) {
            console.error('Impossibile creare il libro master', err)
            throw err
        } finally {
            loading.value = false
        }
        
    }

    // aggiornamento dati e immagine libro master
    async function updateLibroMaster(id, libro, copertina=null) {
        loading.value = true
        try {
            if(copertina) {
                libro.append('file', copertina)
                libro.append('type','copertina')
            }
            //effettuo la chiamata al backend per aggiornare il libro
            const libro_master_aggiornato = await chiamaAPI(`/libriMaster/${id}`, {
                method: 'PATCH',
                body:  libro 
            })
            //console.log("Catalogo Master:", catalogo_master.value)
            //console.log("id:", id)

            // cerco elemento con id e lo aggiorno con i dati aggiornati
            const elemento = catalogo_master.value.find( elemento_array => elemento_array.id === id)
            //console.log("elemento:", elemento)
            if (elemento) {
                Object.assign(elemento, libro_master_aggiornato.data)
            }

            // aggiornamento dello stato, se ci sono già i dettagli caricati, faccio il merge per non perdere nulla
            if (libro_master_selezionato.value) {
                Object.assign(libro_master_selezionato.value, libro_master_aggiornato.data)
            } else {
                // Se per qualche motivo era null, lo inizializzo ora
                libro_master_selezionato.value = libro_master_aggiornato.data
            }

            return libro_master_aggiornato
            
        } catch (err) {
            console.error('Impossibile aggiornare il libro master', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // elimina definitivamente libro master
    async function deleteLibroMaster(id) {
        loading.value = true

        try {
            const libro_eliminato = await chiamaAPI(`/libriMaster/${id}`, {
                method: 'DELETE'
            })

           catalogo_master.value = catalogo_master.value.filter(b => b.id !== id)

            return libro_eliminato

        } catch (err) {
            console.error("Impossibile eliminare il libro master",err)
            throw err
        } finally {
            loading.value = false
        }
        
    }

    return {
        catalogo_master,
        libro_master_selezionato,
        loading,
        totale_libri_master,

        getLibriMaster,
        getLibroMasterByID,
        createLibroMaster,
        createLibroMasterISBN,
        updateLibroMaster,
        deleteLibroMaster
    }

})
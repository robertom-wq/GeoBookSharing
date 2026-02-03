//Controller dedicato alle operazioni CRUD relative ai libri master
// sequenza, utente deve aggiungere un libro alla sua libreria, o lo crea da 0, oppure cerca un modello sui master disponibili.
// se non presente tra i master disponibili, prova la ricerca tramite isbn, che a sua volta creerà il master da utilizzare

import prisma from "../config/prisma.js"
import { TipiAzione } from "@prisma/client"
import axios from 'axios'
import { tabella_conversioni_generi } from "../../tabella conversioni_generi.js"
import { downloadERidimensionaCopertine, checkISBN } from "../../utils/toolkit.js"
import path from 'path'
import fs from 'fs'
import logger from '../config/logging.js'

const GOOGLE_BOOKS_KEY=process.env.GOOGLE_BOOKS_KEY

// helper per la scelta della migliore immagine delle copertine da goole Books
const getMiglioreImmagine = (url_immagine) => {
    if(!url_immagine) {
        return null
    }
    return (
        // restituisce la prima che trova partendo dalla qualità pi alta a scendere
        url_immagine.large || url_immagine.medium || url_immagine.small || url_immagine.thumbnail || url_immagine.smallThumbnail || null
    )
}

// Aggiunta di un libroMaster al catalogo tramite codice ISBN 
export const addLibroMasterFromISBN = async (req, res) => {
    // estrapolo isbn dal body
    const { isbn } = req.body

    // validazione veloce del codice ISBN
    if(!isbn || typeof isbn !== 'string') {
        return res.status(400).json({ error: 'Errore nel caricamento del codice ISBN'})
    }

    let isbn_pulito = isbn.trim() // elimino eventuali spazi bianchi
    // verifico che il codice ISBN sia valido tramite funzion checkISBN creata  e disponibile in utils/toolkit implementata tramite libreria esterna isbn3
    const check_isbn = checkISBN(isbn_pulito)

    //se ISBN e stato etichettao come valido ed è stato normalizzato
    if (check_isbn.is_valido && check_isbn.isbn_normalizzato !== null) {
        isbn_pulito = check_isbn.isbn_normalizzato
        console.log("ISBN pulito in controller:", isbn_pulito)
    } else {
        return res.status(400).json({ error: check_isbn.error, isbn: isbn_pulito})
    }
    try {
        // cerco nel database se esiste già il master
        const master_esistente = await prisma.libri_master.findUnique({
            where: { isbn: isbn_pulito }
        })
        if (master_esistente) {
            return res.status(200).json({ message: `Libro master con isbn ${isbn_pulito} già presente nel database` })
        }
        // eseguo la fetch verso google Book API (es https://www.googleapis.com/books/v1/volumes?q=isbn:9791280623508)
        /*
        Durante la fase di sviluppo, è stata riscontrata una criticità relativa ai limiti di quota delle API di Google (HTTP 429).
        Il problema è stato risolto tramite l'implementazione di una API Key dedicata e l'astrazione delle credenziali
        tramite variabili d'ambiente, garantendo così la stabilità del servizio di importazione automatica dei volumi
        */
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn_pulito.replaceAll('-','')}&key=${GOOGLE_BOOKS_KEY}`
        const libro_google = await axios.get(url, {timeout: 10000})

        if(!libro_google.data.items || libro_google.data.items.length ===0){
            return res.status(404).json({ error: 'Libro non trovato su Google Books', isbn_pulito})
        }
        const libro_trovato = libro_google.data.items[0].volumeInfo

        //estrapolazione dati necessari
        const titolo = (libro_trovato.title || 'Sconosciuto').substring(0,500)
        const autore = (libro_trovato.authors?.join(', ') || 'Sconosciuto').substring(0,300)
        //estrapolo solo l'anno di pubblicazione
        const anno = libro_trovato.publishedDate ? parseInt(libro_trovato.publishedDate.split('-')[0], 10) : null 
        const descrizione = libro_trovato.description?.substring(0,2000) || null
        // mi appoggio ad un oggetto json costruito con le traduzioni dei generi letterali piu usati su google Books
        // in modo da averli tradotti in italiano
        const genere_nome = tabella_conversioni_generi[libro_trovato.categories?.[0].toUpperCase()] || 'Non definito' 
        console.log("GENERE", libro_trovato.categories?.[0].toUpperCase(), genere_nome)
        //verifico esistenza genere nel db, se non esiste lo crea upsert(). Questo fa si che chi sceglierà di creare un libro da 0
        // utilizzera generi prestabiliti, in modo da essere uniformi e ottenere statistiche sui generi uniformi
        const genere = await prisma.generi.upsert({
            where: {dettagli : genere_nome},
            update : {},
            create: {dettagli: genere_nome}
        })

        //scelgo la copertina migliore
        const copertina_url = getMiglioreImmagine(libro_trovato.imageLinks)

        // scarico e processo la copertina scelta in modo da avere un main e thumb
        const {main: copertina, thumb: copertina_thumb} = await downloadERidimensionaCopertine(copertina_url)
        
        // aggiungo il libro master al database, in modo da renderlo disponibile a tutti
        const nuovo_libro_master = await prisma.libri_master.create({
            data: {
                isbn: isbn_pulito,
                titolo,
                autore,
                anno,
                descrizione,
                copertina,
                copertina_thumb,
                genere_id: genere.id
            }
        })
        return res.status(200).json({message: 'LIbro Master aggiunto al catalogo globale', data: nuovo_libro_master})

    } catch (err) {
        logger.error("["+ req.ip +"] Errore addLibroMasterFromISBN -> : Errore generico", err)
        console.error('Errore "addLibroMasterFromISBN":', err)
        return res.status(500).json({ error: "Errore server - Impossibile aggiungere libro Master da ISBN"})               
    }
}


//Mostra il catalogo dei libri master o ricerca tramite q=... per genere/titolo/autore
export const getAllLibriMaster = async (req, res) => {
    const { q } = req.query
     // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const queryPagina = req.query.pagina
    const queryLimit = req.query.limit
    // se pagina e/o limit sono  undefined imposto la prima di default 
    let pagina = parseInt(queryPagina) || 1
    const limit = parseInt(queryLimit) || 200
    // intercetto valori inferiori a 1
    if (pagina < 1) {
        pagina = 1
    }
    if (limit < 1) {
        limit = 10
    }
    const skipElementi = (pagina - 1) * limit

    let where = {}

    if(q) {
        // elimino spazi bianchi
        const queryString = q.trim()
        where.OR = [
                // titolo like %queryString%
                {titolo: { contains: queryString, mode: 'insensitive'}},
                {autore: { contains: queryString, mode: 'insensitive'}},
                {genere: { dettagli: { contains: queryString, mode: 'insensitive'}}},
            ]
    }
    try {
    //recupero tutti i libri master in base ai criteri di ricerca e il conteggio totale
    const [libri, conteggioTotale] = await prisma.$transaction([
            prisma.libri_master.findMany({
                where,
                include: {
                    genere: {select: {dettagli: true}},
                },
                orderBy: [
                    { 
                        genere: {dettagli: 'asc'}
                    },
                    {
                        titolo: 'asc'
                    }
                ],
                take: limit,
                skip: skipElementi
            }),
            prisma.libri_master.count({ // Query per il conteggio
                where
            })
        ])

     return res.status(200).json({
            message: `Libri Master trovati con q="${q}"`,
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            data: libri
        })
    } catch(err) {
        logger.error("["+ req.ip +"] Errore getAllLibriMaster -> : Errore generico",err)
        console.error('Errore "getAllLibriMaster":', err)
        return res.status(500).json({ error: "Errore server - getAllLibriMaster"})         
    }


}


//Visualizzazione dei dettagli di un libro master con id in params
export const getLibroMasterById = async (req, res) => {
    const targetId = parseInt(req.params.id)

     try {
        // ricerco il libro
        const libro = await prisma.libri_master.findUnique({
            where: {id: targetId},
            include: {
                genere: { select: {dettagli: true}},
            }
        })
        // controllo esistenza del libro
        if(!libro) {
            return res.status(404).json({error: `Libro Master con id:${targetId} non trovato.`})
        }

        return res.status(200).json({message: `Libro Master id:${targetId} trovato`, data: libro})

    } catch(err) {
        logger.error('['+ req.ip +'] Errore getLibroMasterById -> : Errore generico',err)
        console.error('Errore "getLibroMasterById":', err)
        return res.status(500).json({ error: `Errore server - Impossibile recuperare libro Master con id ${targetId}`})        
    }


}


//Creazione libro master manuale. SOLO ADMINS per evitare confusione e abusi
export const createLibroMaster = async (req, res) => {
    const isAdmin = req.isAdmin
    const mioId = req.userId
    //controllo di sicurezza sui permessi dell'utente loggato
    if(isAdmin) {
        const {isbn, titolo, autore, anno, descrizione, genere, type} = req.dati_validati
        let isbn_pulito = isbn.trim()
        // verifico che il codice ISBN sia valido tramite funzion dedicata in utils/toolkit
        const check_isbn = checkISBN(isbn_pulito)

        if (check_isbn.is_valido && check_isbn.isbn_normalizzato !== null) {
            isbn_pulito = check_isbn.isbn_normalizzato
            console.log("ISBN pulito in controller:", isbn_pulito)
        } else {
            return res.status(400).json({ error: check_isbn.error, isbn: isbn_pulito})
        }
        try {
            //controllo se libro esiste già tramite isbn univoco
            const libro_esistente = await prisma.libri_master.findUnique({
                where: { isbn: isbn_pulito}
            })
            if(libro_esistente) {
                return res.status(400).json({error: `ISBN ${isbn_pulito} già presente nel catalogo`})
            }
            // effettuo controllo se esite sun google books, se esiste blocca operazione e rimanda
            // ad eseguire aggiunta tramite ISBN
            try {
                const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn_pulito.replaceAll('-','')}`
                const response = await axios.get(url, {timeout: 10000})

                if(response.data.items?.length > 0){
                    return res.status(400).json({ error: 'Libro trovato su Google Books, aggiungilo al catalogo globale tramite ISBN', suggerimento: 'Usa /fromISBN'})
                }
            } catch (err) {
                logger.error(`[${req.ip}] Errore createLibroMaster -> : Impossibile verificare su google books presenza di ISBN ${isbn_pulito}`, err)
                console.error(`Impossibile verificare su google books presenza di ISBN ${isbn_pulito}`)
                return res.status(500).json({ error: "Errore server - createLibroMaster Riprova più tardi"})
            }

            // trova/crea genere
            const genere_record = await prisma.generi.upsert({
                where: { dettagli: genere || 'Non definito'},
                update: {},
                create: { dettagli: genere || 'Non definito'}
            })

            // gestione copertine
            let copertina = null
            let copertina_thumb = null
            // verifico se nella req è presente un fileRidimensionato
            if(req.fileRidimensionato) {
                copertina = req.fileRidimensionato.main
                copertina_thumb = req.fileRidimensionato.thumb
            }

            // creo il record nel database
            const nuovo_master = await prisma.libri_master.create({
                data: {
                    isbn: isbn_pulito,
                    titolo,
                    autore,
                    anno,
                    descrizione,
                    copertina,
                    copertina_thumb,
                    genere_id: genere_record.id
                }
            })

            return res.status(201).json({
                message: 'Libro Master creato con successo',
                data: nuovo_master
            })

        } catch (err) {
            logger.error('['+ req.ip +'] Errore createLibroMaster -> : Errore generico', err)
            console.error('Errore "createLibroMaster":', err)
            return res.status(500).json({ error: "Errore server - Impossibile aggiungere libro da Master"})               
            
        }
    } else {
        logger.warn(`[${req.ip}] L'utente id:${mioId} ha tentato di creare un Libro Master. Richiesta bloccata`)
        return res.status(403).json({ error: `Non autorizzato alla creazione di libri Master`})
    }
}



//Delete libro master  SOLO ADMINS
export const deleteLibroMaster = async (req, res) => {
    const isAdmin = req.isAdmin
    const mioId = req.userId
    const mioUsername = req.userUsername
    const targetId = parseInt(req.targetId)

    if(isAdmin) {
        try {
            // verifico esistenza libro master
            const libro_master_esistente = await prisma.libri_master.findUnique({
                where: { id: targetId}
            })

            if (!libro_master_esistente) {
                return res.status(404).json({error: `Libro master id:${targetId} non trovato`})
            }
            await prisma.$transaction(async (tx) => {
                // Elimina il record dal database. Se questo fallisce, l'intera transazione fallisce .
                await tx.libri_master.delete({
                    where: { id: targetId }
                })
                await tx.storico_eliminazioni.create({
                    data: {
                        esecutore_id: mioId,
                        esecutore_username: mioUsername,
                        target_ID: targetId,
                        target_nome: libro_master_esistente.titolo,
                        azione: TipiAzione.DELETE_LIBRO_MASTER
                    }
                })
            })
        return res.status(200).json({message: `Libro Master con id:${targetId} eliminato con successo`})
        } catch (err) {
            logger.error('['+ req.ip +'] Errore deleteLibroMaster -> : Errore generico',err)
            console.error('Errore "deleteLibroMaster":', err)
            return res.status(500).json({ error: "Errore server - Impossibile rimuovere libro Master"})        
            }

    }else {
        logger.warn(`[${req.ip}] L'utente id:${mioId} ha tentato di eliminare un Libro Master. Richiesta bloccata`)
        return res.status(403).json({ error: `Non autorizzato alla rimozione di libri Master`})
    }
}


//Aggiornamento libro master  SOLO ADMINS
export const updateLibroMaster = async (req, res) => {
    const isAdmin = req.isAdmin
    const mioId = req.userId
    const targetId = parseInt(req.targetId)
    // dati validati da validate(updateLibriSchema)
    let data = {...req.dati_validati}
    console.log("DATA",data)
    console.log("DATA ANNO LIBRO MASTER",typeof(data.anno))

    if (isAdmin) {
        //rimuovo il campo type dall'oggetto.. è utile solo per l'upload dell'immagine ma non fa parte dei campi db
        if (data.type) {
            //destrutturazione
            const {type, ...dati_puliti } = data
            // sovrascrivo oggetto data con i dati effettivamente aggiornabili
            data = dati_puliti
        }
         // verifico se nella richiesta vi sono files per la copertina proveniente dal middleware uploadImgERidimensiona
        if(req.fileRidimensionato) {
            data.copertina = req.fileRidimensionato.main
            data.copertina_thumb = req.fileRidimensionato.thumb
        }
        
        //verifico che siano stati inviati dati aggiornare in data
        if(Object.keys(data).length === 0) {
            return res.status(304).json({message: "Niente da aggiornare"})
        }
        try {
            // recupero vecchi path copertine
            const libromMasterPreUpdate = await prisma.libri_master.findUnique({
            where: {id: targetId},
            select: {copertina:true, copertina_thumb: true}
            })
            if (!libromMasterPreUpdate) {
                return res.status(404).json({ error: `Libro Master id:${targetId} non trovato`})
            }
            let libroMasterAggiornato
        
            libroMasterAggiornato = await prisma.libri_master.update({
                    where: { id: targetId },
                    data,
                    include: {
                        genere: { select: {dettagli: true}},
                    }
                })

            if(req.fileRidimensionato) {
                const vecchiFiles = [libromMasterPreUpdate.copertina, libromMasterPreUpdate.copertina_thumb].filter(Boolean)
                    //procedo all'eliminazione
                vecchiFiles.forEach( url => {
                    // solitamente i libri caricati da google.books non hanno entrambe le immagini
                    // ma solo la main, quindi verifico se esistono i path
                    if (url) {
                        const file_path = path.join(process.cwd(), url)
                        fs.unlink(file_path, err => {
                            if (err && err.code !=='ENOENT') {
                                console.error("Non è stato possibile rimuovere vecchie immagini")
                                logger.warn("["+ req.ip +"] Non è stato possibile rimuovere vecchie immagini")
                            }
                        })
                    }
                })   
            }
            logger.info(`[${req.ip}] L'utente id:${mioId} ha aggiornato il Libro Master id:${targetId}`)
            return res.status(200).json({message:`Libro Master id:${targetId} aggiornato: `, data: libroMasterAggiornato})

            
        } catch (err) {
            logger.error(`[${req.ip}] Errore updateLibroMaster -> : Errore generico`, err)
            console.error('Errore "updateLibroMaster":', err)
            return res.status(500).json({ error: "Errore server - Impossibile modificare libro  Master"})               
        }

    }else {
        logger.warn(`[${req.ip}] L'utente id:${mioId} ha tentato di aggiornare un Libro Master. Richiesta bloccata`)
        return res.status(403).json({ error: `Non autorizzato alla modifica di libri Master`})        
    }
} 
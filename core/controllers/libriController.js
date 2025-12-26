import prisma from "../config/prisma.js"

import path from 'path'
import fs from 'fs'
import logger from "../config/logging.js"
import { Prisma, TipiAzione } from '@prisma/client'; // Importa l'oggetto Prisma

/*
Creazione manuale di un libro
*/
export const createLibro = async (req, res) => {
    
    const mioId = req.userId

    // gestione upload copertina
    let copertina = null
    let copertina_thumb = null
    // controllo se dal middleware uploadImgERidimensiona mi arriva un file ridimensionato
    if (req.fileRidimensionato) {
        // controllo extra, se il tipo non è copertina, restituisco un 400
        if (req.body.type !== 'copertina') {
            return res.status(400).json({error: "Il type deve essere 'copertina'"})
        }
        copertina = req.fileRidimensionato.main
        copertina_thumb = req.fileRidimensionato.thumb
    }
    //estraggo tutti i dati validati che sono arrivati dal middleware valida_dati(createLibroSchema)
    const data = {...req.dati_validati}

    // se è stata caricata un'immagine di copertina accodo i dati relativi a "data"
    if (copertina){
        data.copertina = copertina
        data.copertina_thumb = copertina_thumb
    }
    data.proprietario_id = mioId

    try {
        //verifico la proprieta dello scaffale prima di associargli il libro
        const scaffale_id = data.scaffale_id
        const scaffale = await prisma.scaffali.findUnique({
            where: {id: scaffale_id},
            select: {proprietario_id: true}
        })

        if( !scaffale) {
            return res.status(404).json({error: 'Scaffale non trovato'})
        }
        if (scaffale.proprietario_id !== mioId) {
            logger.warn(`L'utente id:${mioId} ha tentato di associare un libro ad uno scaffale non suo (id:${scaffale_id}). Operazione bloccata.`)
            return res.status(403).json({error: "Non autorizzato"})
        } 

        // creazione libro
        const libro = await prisma.libri.create({
            data,
            include: {
                scaffale: {select: {nome: true}},
                genere: {select: {dettagli: true}},
                tipo_condivisione: {select: {dettagli: true}}
            }
        })

        return res.status(201).json({message: `Libro ${libro.titolo}, creato con successo`, libro: libro})
        
    } catch (err) {
        logger.error('Errore createLibro -> : Errore generico')
        console.error('Errore "createLibro":', err)
        return res.status(500).json({ error: "Errore server - Impossibile creare il libro"})
    }
}

/*
Restituisce tutti i libri in possesso dell'utente loggato 
*/
export const getMieiLibri = async (req, res) => {
    const mioId = req.userId
    
    // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const queryPagina = req.query.pagina
    const queryLimit = req.query.limit
    // se pagina e/o limit sono  undefined imposto la prima di default 
    let pagina = parseInt(queryPagina) || 1
    const limit = parseInt(queryLimit) || 10
    // intercetto valori inferiori a 1
    if (pagina < 1) {
        pagina = 1;
    }
    if (limit < 1) {
        limit = 10;
    }
    const skipElementi = (pagina - 1) * limit;

    try {
        const [libri, conteggioTotale] = await prisma.$transaction([
            prisma.libri.findMany({
                where: { proprietario_id : mioId},
                include: {
                    scaffale : { select: {id: true, nome: true}},
                    genere: {select: {dettagli: true}},
                    tipo_condivisione: {select: {dettagli: true}},
                },
                orderBy: { titolo: 'asc'},
                take: limit,
                skip: skipElementi
            }),
            prisma.libri.count({ // Query per il conteggio
                where: {proprietario_id : mioId }
            })
        ])


        return res.status(200).json({ 
            message: 'Libri personali recuperati:',
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            libri: libri})

    } catch (err) {
        logger.error('Errore getMieiLibri -> : Errore generico')
        console.error('Errore "getMieiLibri":', err)
        return res.status(500).json({ error: "Errore server - Impossibile recuperare i miei libri"})
        
    }
}

/*
Ricerca libri tramite id come parametro
*/
export const getLibroById = async (req, res) => {
    const targetId = parseInt(req.params.id)
    const mioId = req.userId

    try {
        const libro = await prisma.libri.findUnique({
            where: {id: targetId},
            include: {
                proprietario: { select: { username: true, avatar: true, avatar_thumb: true, valutazioni_ricevute: true}},
                scaffale: { select: {id: true, nome: true}},
                genere: { select: {dettagli: true}},
                tipo_condivisione: { select: {dettagli: true}}
            }
        })
        // contrllo esistenza del libro
        if(!libro) {
            return res.status(404).json({error: `Libro con id:${targetId} non trovato.`})
        }
        //incremento visualizzazioni libro (se libro visitato da utente diverso da proprietario)
        if (libro.proprietario_id !== mioId) {
            const libroVisualizzazioneUpdated = await prisma.libri.update({
                data: {visualizzazioni: {increment: 1 }},
                where: {id: targetId}
        })
        libro.visualizzazioni = libroVisualizzazioneUpdated.visualizzazioni;
        }
        return res.status(200).json({message: `Libro id:${targetId} trovato`, libro: libro})
    } catch (err) {
        logger.error('Errore getLibroById -> : Errore generico')
        console.error('Errore "getLibroById":', err)
        return res.status(500).json({ error: `Errore server - Impossibile recuperare libro con id ${targetId}`})        
    }
}


/*
Ricerca libri con query di ricerca autore, titolo o genere
*/
export const getAllLibri = async (req, res) => {
    const mioId = req.userID
     // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const queryPagina = req.query.pagina
    const queryLimit = req.query.limit
    // se pagina e/o limit sono  undefined imposto la prima di default 
    let pagina = parseInt(queryPagina) || 1
    const limit = parseInt(queryLimit) || 10
    // intercetto valori inferiori a 1
    if (pagina < 1) {
        pagina = 1;
    }
    if (limit < 1) {
        limit = 10;
    }
    const skipElementi = (pagina - 1) * limit;

    const { q } = req.query
    try {
        let where = {
            // escludo libri utente loggato
            proprietario_id : {not: mioId}
        }
        if(q) {
            // elimino spazi bianchi
            const queryString = q.trim()
            where.OR = [
                    // username like %queryString%
                    {titolo: { contains: queryString, mode: 'insensitive'}},
                    {autore: { contains: queryString, mode: 'insensitive'}},
                    {genere: { dettagli: { contains: queryString, mode: 'insensitive'}}}
                 ]
        }
        const [libri, conteggioTotale] = await prisma.$transaction([
            prisma.libri.findMany({
                where,
                include: {
                    proprietario: {select: {id: true, username: true}},
                    scaffale: {select: {id:true, nome:true}},
                    genere: {select: {dettagli: true}},
                    tipo_condivisione: {select:  { dettagli: true}}
                },
                orderBy: { titolo: 'asc'},
                take: limit,
                skip: skipElementi
            }),
            prisma.libri.count({ // Query per il conteggio
                where
            })
        ])

        return res.status(200).json({
            message: `Libri trovati con q="${q}"`,
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            libri: libri
        })

    } catch (err) {
        logger.error('Errore getAllLibri -> : Errore generico')
        console.error('Errore "getAllLibri":', err)
        return res.status(500).json({ error: "Errore server"})        
    }
    
}

/*
Ricerca tutti libri disponibili (da eliminare)
*/
export const getAllDisponibili = async (req, res) => {
    // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const queryPagina = req.query.pagina
    const queryLimit = req.query.limit
    // se pagina e/o limit sono  undefined imposto la prima di default 
    let pagina = parseInt(queryPagina) || 1
    const limit = parseInt(queryLimit) || 10
    // intercetto valori inferiori a 1
    if (pagina < 1) {
        pagina = 1;
    }
    if (limit < 1) {
        limit = 10;
    }

    const skipElementi = (pagina - 1) * limit;

    try {
        // utilizzo transaction che permette di eseguire più operazioni sul database in un unico blocco
        // invia entrambe le query al database in un unico blocco
        const [libri, conteggioTotale] = await prisma.$transaction([
            prisma.libri.findMany({
                        where: {is_disponibile: true},
                        include: {
                            proprietario: {select: {id: true, username: true}},
                            scaffale: {select: {id: true, nome: true}},
                            tipo_condivisione:{select: {dettagli: true}} 
                        },
                        orderBy: { titolo: 'asc'},
                        take: limit,
                        skip: skipElementi
                }),
            prisma.libri.count({ // Query per il conteggio
                where: { is_disponibile: true }
            })
        ])

    return res.status(200).json({
        message: 'Libri trovati',
        paginaCorrente: pagina,
        elementiPerPagina: limit,
        conteggioTotale: conteggioTotale,
        pagineTotali: Math.ceil(conteggioTotale / limit),
        libri: libri})

    } catch (err) {
        logger.error('Errore getAllDisponibili -> : Errore generico')
        console.error('Errore "getAllDisponibili":', err)
        return res.status(500).json({ error: `Errore server - Impossibile recuperare libri disponibili`})            
    }
}

/*
Restituisce tutti i tipi di condivisione censiti nel DB
*/
export const getAllTipiCondivisione = async (req, res) => {
        try {
        const tipiCondivisione = await prisma.tipi_condivisione.findMany({
            orderBy: {dettagli: 'asc'}
        })
        return res.status(200).json({
            message: 'Tipi di condivisione trovati',
            tipiCondivisione: tipiCondivisione
        })
    } catch(err) {
        logger.error('Errore getAllTipiCondivisione -> : Errore generico')
        console.error('Errore "getAllTipiCondivisione":', err)
        return res.status(500).json({ error: "Errore server"})   
    }
}

/*
Restituisce tutti i generi letterari censiti nel DB
*/
export const getAllGeneriLetterari = async (req, res) => {
    try {
        const generiLetterari = await prisma.generi.findMany({
            orderBy: {dettagli: 'asc'}
        })
        return res.status(200).json({
            message: 'Generi letterari trovati',
            generiLetterari: generiLetterari
        })
    } catch(err) {
        logger.error('Errore getAllLibri -> : Errore generico')
        console.error('Errore "getAllLibri":', err)
        return res.status(500).json({ error: "Errore server"})   
    }
}

/*
Aggiornamento dettagli libro presenti nella libreria
*/
export const updateLibro = async (req, res) => {
    const targetId = parseInt(req.params.id)
    const mioId = req.userId
    let nuovaCopertina = null
    let nuovaCopertina_thumb = null
    
    // verifico se nella richiesta vi sono files per la copertina proveniente dal middleware uploadImgERidimensiona
    if(req.fileRidimensionato) {
        //verifico che il type sia giusto
        if(req.body.type !== 'copertina'){
            return res.status(400).json({error: "Il type deve essere 'copertina'"})
        }
        nuovaCopertina = req.fileRidimensionato.main
        nuovaCopertina_thumb = req.fileRidimensionato.thumb
    }
    // dati validati da validate(updateLibriSchema)
    const data = {...req.dati_validati}
    if (nuovaCopertina) {
        data.copertina = nuovaCopertina
        data.copertina_thumb = nuovaCopertina_thumb
    }

    //verifico che siano stati inviati dati aggiornare in data
    if(Object.keys(data).length === 0) {
        return res.status(304).json({message: "Niente da aggiornare"})
    }
    try {
        // verifico prorpietà del libro
        const libroPreUpdate = await prisma.libri.findUnique({
            where: {id: targetId},
            select: {proprietario_id: true, copertina:true, copertina_thumb: true}
        })
        if (!libroPreUpdate) {
            return res.status(404).json({ error: `Libro id:${targetId} non trovato`})
        }
        if (libroPreUpdate.proprietario_id !== mioId) {
            logger.warn(`L'utente id:${mioId} ha tentato di modificare il libro id:${targetId} senza autorizzazione. Richiesta bloccata`)
            return res.status(403).json({ error: `Non autorizzato ala modifica de Libro id:${targetId}`})
        }
        
        let libroAggiornato;
        
        // aggiornamento
        // Se fallisce, esegue ROLLBACK e salta direttamente al catch.
        libroAggiornato = await prisma.$transaction(async (tx) => {
             return await tx.libri.update({
                where: { id: targetId },
                data,
                include: {
                    scaffale: {select: { id: true, nome: true}},
                    genere: { select: {dettagli: true}},
                    tipo_condivisione: { select: {dettagli: true}}
                }
            })
        })

        if(nuovaCopertina) {
            const vecchiFiles = [libroPreUpdate.copertina, libroPreUpdate.copertina_thumb].filter(Boolean);
                //procedo all'eliminazione
            vecchiFiles.forEach( url => {
                // solitamente i libri caricati da google.books non hanno entrambe le immagini
                // ma solo la main, quindi verifico se esistono i path
                if (url) {
                    const file_path = path.join(process.cwd(), url)
                    fs.unlink(file_path, err => {
                        if (err && err.code !=='ENOENT') {
                            console.error("Non è stato possibile rimuovere vecchie immagini")
                            logger.warn("Non è stato possibile rimuovere vecchie immagini")
                        }
                    })
                }
            })   
        }
        logger.info("L'utente id:" + mioId + " ha aggiornato il profilo id:" + targetId)
        return res.status(200).json({message:`Libro id:${targetId} aggiornato: `, libro: libroAggiornato})

    } catch (err) {
        logger.error('Errore updateLibro -> : Errore generico')
        console.error('Errore "updateLibro":', err)
        return res.status(500).json({ error: "Errore server - updateLibro"})           
    }
}


/*
Eliminazione definitiva libro dal DB (admin o proprietario)
*/
export const deleteLibro = async (req, res) => {
    const targetId = parseInt(req.params.id)
    const isAdmin = req.isAdmin
    const mioId = req.userId
    const mioUsername = req.userUsername

    try {
        // ricerco il libro da eliminare, verificando se utente non ha prestiti in atto
        const libro = await prisma.libri.findUnique({
        where: {id: targetId, is_disponibile: true},
        select: {proprietario_id: true, titolo: true, copertina: true, copertina_thumb:true},
        })
        if(!libro) {
            return res.status(404).json({error: `Libro ${targetId} non trovato oppure in prestito`})
        }
        // solo admin o proprietario possono cancella un libro
        if (isAdmin || libro.proprietario_id === mioId ) {
            // se transazione fallisce, esegue ROLLBACK e solleva eccezione e salta al blocco catch
            await prisma.$transaction(async (tx) => {
                // Elimina il record dal database. Se questo fallisce, l'intera transazione fallisce .
                await tx.libri.delete({
                    where: { id: targetId }
                });
                await tx.storico_eliminazioni.create({
                    data: {
                        esecutore_id: mioId,
                        esecutore_username: mioUsername,
                        target_ID: targetId,
                        target_nome: libro.titolo,
                        azione: TipiAzione.DELETE_LIBRO
                    }
                })
            });

            /////////// aggiornamento: implementare ELIMINAZIONE COPERTINA dal disco fisso/////////////
            if (libro.copertina || libro.copertina_thumb) {
                const filesToDelete = [libro.copertina, libro.copertina_thumb].filter(Boolean);
                //procedo all'eliminazione
                filesToDelete.forEach( url => {
                    // solitamente i libri caricati da google.books non hanno entrambe le immagini
                    // ma solo la main, quindi verifico se esistono i path
                    if (url) {
                        const file_path = path.join(process.cwd(), url)
                        fs.unlink(file_path, err => {
                            if (err && err.code !=='ENOENT') {
                                console.error("Non è stato possibile rimuovere vecchie immagini")
                                logger.warn("Non è stato possibile rimuovere vecchie immagini")
                            }
                        })
                    }
                })

            } 
 
            /////////// fine aggiornamento: implementare ELIMINAZIONE COPERTINA dal disco fisso/////////////

            logger.info("L'utente id:" + mioId + " ha eliminato il libro id:" + targetId)
            return res.status(200).json({message: `Il libro id:${targetId} è stato rimosso con successo`})
        } else {
            logger.warn(`L'utente id:${mioId} ha tentato di eliminare il libro id:${targetId} senza autorizzazione. Richiesta bloccata`)
            return res.status(403).json({ error: `Non hai le autorizzazioni per eliminare questo libro` })
        }
    } catch (err) {
        logger.error('Errore deleteLibro -> : Errore generico')
        console.error('Errore "deleteLibro":', err)
        return res.status(500).json({ error: "Errore server - deleteLibro"})   
    }
    
}

/*
Permette di creare un libro da un modello Master scaricato da googleBook, questo permette
di avere già tutti i dettagli del libro
*/
export const createLibroFromMaster = async (req, res) => {
    const { master_id, scaffale_id } = req.dati_validati
    const mioId = req.userId

    try {
        const scaffale = await prisma.scaffali.findUnique({
            where: {id: parseInt(scaffale_id)}
        })
        // verifico se esiste lo scaffale sul quale si sta tentando di aggiungere un libro
        if (!scaffale) {
            return res.status(404).json({ error: `Scaffale id:${scaffale_id} non trovato.`})
        }
        // verifico se l'utente che effettua la richiesta è il proprietario dello scaffale
        if (scaffale.proprietario_id !== mioId) {
            logger.warn(`L'utente id:${mioId} ha tentato di associare un libro ad uno scaffale non suo (id:${scaffale_id}). Operazione bloccata.`)
            return res.status(403).json({ error: `Scaffale id:${scaffale_id} non tuo.`})
        }

        //recupero dati dal libro master
        const master = await prisma.libri_master.findUnique({
            where: { id: master_id}
        })
        if (!master) {
            return res.status(404).json({error: `Master id:${scaffale_id} non trovato.`})
        }

        // creo copia personale da libro master
        const nuovo_libro = await prisma.libri.create({
            data: {
                proprietario_id: mioId,
                scaffale_id: parseInt(scaffale_id),
                // campi copiati dal master
                master_id: master.id,
                titolo: master.titolo,
                autore: master.autore,
                anno: master.anno,
                descrizione: master.descrizione,
                copertina: master.copertina,
                genere_id: master.genere_id,
                tipo_condivisione_id: 999, //default
                is_disponibile: true
            }
        })
        return res.status(201).json({ message: 'Libro aggiunto alla tua libreria', libro: nuovo_libro})
    } catch (err) {
        logger.error('Errore createLibroFromMaster -> : Errore generico')
        console.error('Errore "createLibroFromMaster":', err)
        return res.status(500).json({ error: "Errore server - createLibroFromMaster"})   

    }
}

/*
Restituisce la top 10 dei libri piu ricercati e di cui è stata visualizzata anteprima
*/
export const getLibriPiuVisitati = async (req, res) => {
    const mioId = req.userId
    const limit = 10
     try {
        const libriPiuVisitati = await prisma.libri.findMany({
            take: limit,
            orderBy: {visualizzazioni: 'desc'}
        })
        return res.status(201).json({message:'Top 10 dei libri piu ricercati e di cui è stata visualizzata anteprima', data: libriPiuVisitati})
     } catch (err) {
        logger.error('Errore getLibriPiuVisitati -> : Errore generico')
        console.error('Errore "getLibriPiuVisitati":', err)
        return res.status(500).json({ error: "Errore server - getLibriPiuVisitati"})          
     }
}


/*
Ricerca libri per titolo/autore, genere e posizione
*/
export const getLibriVicini = async (req, res) => {
    const {lat, lng, dist=5000, q='' } = req.query

    const mioId = req.userId
    const lat_num = parseFloat(lat)
    const lng_num = parseFloat(lng)
    const dist_num = parseFloat(dist)

    //controllo che tutti i parametri di posizione siano numerici
    if (isNaN(lat_num) || isNaN(lng_num) || isNaN(dist_num)) {
        return res.status(400).json({ error: "Parametri lat, lng o dist non validi"})
    }
    
    try {
        // Preparazione della stringa di ricerca da usare come filtro where, per titolo/autore o genere,
        // trasformandola in minuscolo e aggiungendo i LIKE se presente
        let sql_where_filtro = Prisma.empty
        if (q && q.trim()){
            const termine_ricercato = `%${q.trim().toLowerCase()}%`
            sql_where_filtro = `
            AND (l.titolo LIKE ${termine_ricercato} OR l.autore LIKE ${termine_ricercato} OR genere LIKE ${termine_ricercato})`
        }
        
        //preparo la query principale parametrizzata tramite prisma.sql, per evitare sql injections
        const sql_query = Prisma.sql`
        SELECT
            l.id,
            l.titolo,
            l.autore,
            l.anno,
            l.descrizione,
            l.copertina,
            l.copertina_thumb,
            g.dettagli AS genere,
            t.dettagli AS tipo_condivisione,
            u.id AS proprietario_id,
            u.username AS proprietario_username,
            u.avatar AS proprietario_avatar,
            u.avatar_thumb AS proprietario_avatar_thumb,
            s.id AS scaffale_id,
            s.nome AS scaffale_nome,
            COALESCE(ST_AsText(s.posizione), 'Nessuna Posizione') AS posizione,
            ST_Distance(
                    s.posizione::geography,
                    --crea il punto di riferimento (la posizione dell'utente che esegue la ricerca) e gli assegna il sistema di coordinate
                    ST_SetSRID(ST_MakePoint(${lng_num}, ${lat_num}), 4326)::geography
                ) AS distanza_metri
            FROM libri l
            JOIN scaffali s ON l.scaffale_id = s.id
            JOIN utenti u ON u.id = s.proprietario_id
            JOIN generi g ON g.id = l.genere_id
            JOIN tipi_condivisione t ON t.id = l.tipo_condivisione_id
            WHERE
                l.is_disponibile = true --Valutare se utile oppure se è utile vederli tutti
                AND s.posizione IS NOT NULL
                -- AND u.id != ${mioId} -- escludo i propri scaffali dalla ricerca
                AND ST_DWithin(
                        s.posizione::geography,
                        ST_SetSRID(ST_MakePoint(${lng_num}, ${lat_num}), 4326)::geography,
                        ${dist_num}
                    )
                ${sql_where_filtro} -- altri filtri provenienti dalla query della req
                ORDER BY distanza_metri ASC
                LIMIT 20
        `
        //esegu la query appena creata
        const libri = await prisma.$queryRaw(sql_query)

        //mappo il risultato
        const libri_vicini = libri.map(libro => ({
            id: libro.id,
            titolo: libro.titolo,
            autore: libro.autore,
            anno: libro.anno,
            descrizione: libro.descrizione || null,
            copertina: libro.copertina,
            copertina_thumb: libro.copertina_thumb,
            genere:{ dettagli: libro.genere},
            tipo_condivisione: { dettagli: libro.tipo_condivisione},
            proprietario: {
                id: libro.proprietario_id,
                username: libro.proprietario_username,
                avatar: libro.proprietario_avatar,
                avatar_thumb: libro.proprietario_avatar_thumb
            },
            scaffale: {
                id: Number(libro.scaffale_id),
                nome: libro.scaffale_nome,
            },
            posizione: libro.posizione,
            distanza_metri: Number(libro.distanza_metri),
            distanza_km: (libro.distanza_metri / 1000).toFixed(2)
        }))
        return res.status(200).json({
            trovati: libri_vicini.length,
            parametri: { lat: lat_num, lng: lng_num, dist: dist_num, q: q || null},
            libri: libri_vicini
        })
        } catch (err) {
            logger.error('Errore getLibriVicini -> : Errore generico')
            console.error('Errore "getLibriVicini":', err)
            res.status(500).json({ error: "Errore server - Impossibile completare la ricerca dei libri vicini"})           
    }
    
}

export const getGeneriPiuComuni = async (req, res) => {
    console.log('implementare')
}
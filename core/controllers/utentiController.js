/*
GESTISCE LA LOGICA DI BUSINNESS DI:
- getAllUtenti
- getUtente
- updateUtente
- softDeleteUtente
- deleteUtente

Operazioni CRUD su utenti

*/

import prisma from "../config/prisma.js"
import logger from "../config/logging.js"
import bcrypt from "bcryptjs"
import fs from 'fs'
import path from 'path'

/*
Restituisce la lista di tutti gli utenti, funzionalità utile per gli admin per 
eseguire successivi cambi di ruolo, oppure attivare o disattivare il ban.
Utile anche per gli utenti, i quali
vedranno campi limitati, per trovare un utente e vedere il suo ranking.
Accetta parametri di ricerca "q"
esempio per admin
[
    {
        "id": 21,
        "username": "admin",
        "avatar": null,
        "avatar_thumb": null,
        "visualizzazioni": 0,
        "biografia": null,
        "nome": "Admin",
        "cognome": "System",
        "bannato": false,
        "ruolo": "admin",
        "data_creazione": "2025-11-30T20:32:57.856Z",
        "data_ultima_modifica": "2025-11-30T20:32:57.856Z",
        "richiesta_eliminazione": false,
        "data_richiesta_eliminazione": null
    }
]
*/
export const getAllUtenti = async (req, res) => {
    //estrae la proprietà q dall'oggetto req.query. Se non esiste sarà "undefined"
    const { q } = req.query

    try {
       let where = {
        // escludo utente loggato
        id : {not: req.userID}
       }
       if (q) {
        // elimino spazi bianchi
        const queryString = q.trim()
        // verifico se queryString è un numero (usato nella ricerca tramite ID)
        const isQueryStringANumber = !isNaN(queryString) && queryString !== '' 

        // costruisco filtro dinamico where, diffenziando tra admin e user
        if (req.isAdmin) {
            // admin
            if (isQueryStringANumber) {
                // se queryString è un numero sicuramente è un id da ricercare
                where.id = parseInt(queryString)
            } else {
                where.OR = [
                    // username like %queryString%
                    {username: { contains: queryString, mode: 'insensitive'}},
                    {cognome: { contains: queryString, mode: 'insensitive'}},
                    {nome : { contains: queryString, mode: 'insensitive'}},
                    {email: { contains: queryString, mode: 'insensitive'}},
                    {ruolo: { contains: queryString, mode: 'insensitive'}}
                ]
            }
        } else {
            // utente
            if (!isQueryStringANumber) {
                where.username = { contains: queryString, mode: 'insensitive'}
            } else {
                res.status(401).json({error: "Non sei autorizzato alla ricerca tramite ID"})
            }
        }
       }

       const utenti = await prisma.utenti.findMany({
        //clausola where dinamicamente costruita in precedenza
        where,
        select: {
            id: true,
            username: true,
            avatar: true,
            avatar_thumb: true,
            visualizzazioni: true,
            biografia: true,
            // L'espressione req.isAdmin && { ... } restituisce l'oggetto {...} che contiene tutti i campi sensibili.
            //(...) prende le proprietà di questo oggetto e le aggiunge nell'oggetto select principale.
            ...(req.isAdmin && {
                nome: true,
                cognome: true,
                bannato: true,
                ruolo: true,
                data_creazione: true,
                data_ultima_modifica: true,
                richiesta_eliminazione: true,
                data_richiesta_eliminazione: true,
            })            
        },
        orderBy: {
            username: 'desc'
        }

       })
       res.json(utenti)

    } catch(err) {
        logger.error('Errore getAllUtenti -> : Errore generico')
        console.error('Errore "getAllUtenti":', err)
        res.status(500).json({ error: "Errore server"})
    }

}

/*
Restituisce il profilo dell'utente loggato oppure tramite id. Differenziazione tra
admin (oppure utente loggato) e altri utenti
*/
export const getProfilo = async (req, res) => {
    console.log('controllo profilo')

    //recupero valori passati da middleware auth
    const targetId = req.targetId // auth stabilisce se esiste un parametro oppure se usare utente loggato
    const mioId = req.userId
    const isAdmin = req.isAdmin

    try {
        //query per recupero utente
        const utente = await prisma.utenti.findUnique({
            where: { id: targetId},
            select: {
                id: true,
                username: true,
                avatar: true,
                avatar_thumb: true,
                visualizzazioni: true,
                biografia: true,
                ...(targetId === mioId || isAdmin ? {
                    nome: true,
                    cognome: true,
                    bannato: true,
                    ruolo: true,
                    data_creazione: true,
                    data_ultima_modifica: true,
                    richiesta_eliminazione: true,
                    data_richiesta_eliminazione: true,
                }:{}) // se non è admin oppure utente loggato, mostra solo informazioni pubbliche            
            }
        })
        
        if (!utente) {
            res.status(404).json({ error: 'Utente non trovato'})
        }

        //incremento visualizzazioni utente (se profilo visitato è diverso dal suo)
            if (targetId !== mioId) {
                const utenteVisualizzazioneUpdated = await prisma.utenti.update({
                    data: {visualizzazioni: {increment: 1 }},
                    where: {id: targetId}
            })
            utente.visualizzazioni = utenteVisualizzazioneUpdated.visualizzazioni;
        }
        console.log(utente)

        res.status(200).json(utente);

    } catch (err) {
        logger.error('Errore getProfilo -> : Errore generico')
        console.error('Errore "getProfilo":', err)
        res.status(500).json({ error: "Errore server"})

    }
}


/*
Consente la modifica del profilo utente. Admin può modificare anche i parametri bannato e ruolo
*/
export const updateUtente = async (req, res) => {

    //recupero valori passati da middleware auth
    const targetId = req.targetId // auth stabilisce se esiste un parametro oppure se usare utente loggato
    const mioId = req.userId
    const isAdmin = req.isAdmin

    //uso i dati già validati da Joi
    let data = {...req.dati_validati}

    //verifica autorizzazione
    const isAutorizzato = isAdmin || (targetId === mioId);

    if (!isAutorizzato) {
        // Se non è autorizzato, restituisci immediatamente l'errore 403.
        logger.warn(`L'utente id:${mioId} ha tentato di aggiornare il profilo id:${targetId} senza autorizzazione. Richiesta bloccata`);
        return res.status(403).json({ error: `Non hai le autorizzazioni per modificare un altro profilo` });
    }

    //rimuovo il campo type dall'oggetto.. è utile solo per l'upload dell'immagine ma non fa parte dei campi db
    if (data.type) {
        //destrutturazione
        const {type, ...dati_puliti } = data
        // sovrascrivo oggetto data con i dati effettivamente aggiornabili
        data = dati_puliti
    }

    ///////////////aggiornamento: gestione upload immagine /////////
    if (req.fileRidimensionato) {
        data.avatar = req.fileRidimensionato.main
        data.avatar_thumb = req.fileRidimensionato.thumb
    }
    

    // rimoziono vecchie immagini
    try {
        // cerco i vecchi path
        const vecchi_path = await prisma.utenti.findUnique({
            where: {id: targetId },
            select: { avatar: true, avatar_thumb: true}
        }) 
        console.log(vecchi_path)
        if (vecchi_path) {
            //procedo all'eliminazione
            [vecchi_path.avatar, vecchi_path.avatar_thumb].forEach( url => {
                console.log("url: ", path.join(process.cwd(), url))
                // solitamente i libri caricati da google.books non hanno entrambe le immagini
                // ma solo la main, quindi verifico se esistono i path
                if (url) {
                    const file_path = path.join(process.cwd(), url)
                    console.log("provo ad eliminare: ", file_path)
                    fs.unlink(file_path, err => {
                        if (err && err.code !=='ENOENT') {
                            console.error("Non è stato possibile rimuovere vecchie immagini")
                            logger.warn("Non è stato possibile rimuovere vecchie immagini")
                        }
                    })
                    console.log("File eliminato con successo: ",path.join(process.cwd(), url))
                }
            })
        } 
        
    } catch (err) {
        // non bloccante, in caso di mancata eliminazione immagine
        console.warn("Impossibile rimuovere vecchie immagini")
        logger.warn("Non è stato possibile rimuovere vecchie immagini")
        
    }
    ///////////////FINE aggiornamento: gestione upload immagine /////////


    //se non c'è nulla da aggiornare, risposta anticipata
    if (Object.keys(data).length === 0) {
        return res.json({message: 'Niente da aggiornare'})
    }

    // se si vuole aggiornare la password, procedo alla cifratura
    if (data.hashed_password) {
        const hashed = await bcrypt.hash(data.hashed_password, 12)
        data.hashed_password = hashed
    }

    try {       
        const utente = await prisma.utenti.update({
            where: {id: targetId},
            data,
            select: {
                id: true,
                nome: true,
                cognome: true,
                username: true,
                biografia: true,
                avatar: true,
                avatar_thumb: true,
                email: true,
                ...(isAdmin && {ruolo: true, bannato: true, richiesta_eliminazione: true})

            }
        })
        
        res.status(200).json({message:"Profilo aggiornato: ", utente})
        logger.info("L'utente id:" + mioId + " ha aggiornato il profilo id:" + targetId)
    } catch (err) {
        logger.error('Errore updateProfilo -> : Errore generico')
        console.error('Errore "updateProfilo":', err)
        res.status(500).json({ error: "Errore server"})

    }
}


/* 
Consente il softDelete dell'utente, una volta richiestol'utente verrà oscurato in attesa di eliminazione definitiva dall'admin
Solo l'utente stesso può richiedere la cancellazione o revocarla.
 */

export const softDeleteUtente = async (req, res) => {
    const mioId = req.userId
    let data = {...req.dati_validati}
    
    try {
        const utente = await prisma.utenti.update({
            where: { id: mioId},
            data: {richiesta_eliminazione: data.richiesta_eliminazione},
            select: {
                id: true,
                username: true,
                richiesta_eliminazione: true,
                data_richiesta_eliminazione: true                
            }
        })
        res.status(200).json({message: "Richiesta di eliminazione inviata con successo", utente})
    } catch (err) {
        logger.error('Errore softDelete -> : Errore generico')
        console.error('Errore "softDelete":', err)
        res.status(500).json({ error: "Errore server"})
    }
}


/* 
Questa funzionalità è riservata agli admin che possono cancella definitivamente un utente,
sempre che quest'ultimo abbia flaggato richietsa_eliminazione a true
*/
export const deleteUtente = async (req, res) => {
    
    const isAdmin = req.isAdmin
    const targetId = req.targetId  
    const mioId = req.userId

    if (isAdmin && targetId!==mioId ) {
        try {
            const utente = await prisma.utenti.findUnique({
                where: {id: targetId },
                select: {richiesta_eliminazione: true, avatar: true, avatar_thumb: true}
            })
            
            if (!utente) {
                return res.status(404).json({error: "Utente non trovato"})
            }
            if (!utente.richiesta_eliminazione) {
                return res.status(400).json({error: "Richiesta di eliminazione non presente per l'utente id:" + targetId})
            }

            /////////// aggiornamento: implementare ELIMINAZIONE AVATAR dal disco fisso/////////////
            try {
                if (utente.avatar || utente.avatar_thumb) {
                    //procedo all'eliminazione
                    [utente.avatar, utente.avatar_thumb].forEach( url => {
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
                
            } catch (err) {
                // non bloccante, in caso di mancata eliminazione immagine
                console.warn("Impossibile rimuovere vecchie immagini")
                logger.warn("Non è stato possibile rimuovere vecchie immagini")
                
            }

            /////////// fine aggiornamento: implementare ELIMINAZIONE AVATAR dal disco fisso/////////////


            //cancellazione dal database
            logger.warn("L'utente con id:"+ mioId+ " sta per eliminare l'account id:" + targetId)

            await prisma.utenti.delete({
                where: { id: targetId}
            })

            logger.warn("L'utente con id:"+ mioId+ " HA ELIMINATO l'account id:" + targetId)

            res.status(200).json({message: "Utente eliminato definitivamente con successo"})



        } catch (err) {
            logger.error('Errore deleteUtente -> : Errore generico')
            console.error('Errore "deleteUtente":', err)
            res.status(500).json({ error: "Errore server - Cancellazione utente"})
        }
    } else {
        logger.warn("L'utente con id:"+ mioId+ " ha tentato di eliminare l'account id:" + targetId + "senza averne autorizzazione. Richiesta bloccata")
        return res.status(401).json({error: "Attensione solo gli utenti Admin possono procedere con l'eliminazione"})
    }
}
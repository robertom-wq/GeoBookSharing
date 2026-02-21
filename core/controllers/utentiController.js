//Controller dedicato alle operazioni CRUD sugli utenti

import prisma from "../config/prisma.js"
import logger from "../config/logging.js"
import bcrypt from "bcryptjs"
import fs from 'fs'
import path from 'path'
import { TipiAzione } from '@prisma/client'

/*
Restituisce la lista di tutti gli utenti, funzionalità utile per gli admin per 
eseguire successivi cambi di ruolo, oppure attivare o disattivare il ban.
Utile anche per gli utenti, i quali
vedranno campi limitati, per trovare un utente e vedere il suo ranking.
Accetta parametri di ricerca "q"
*/
export const getAllUtenti = async (req, res) => {
    //estrae la proprietà q dall'oggetto req.query. Se non esiste sarà "undefined"
    const { q, richiesta_eliminazione, bannato, data_richiesta_eliminazione } = req.query
    const mio_id = req.userID
    // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const query_pagina = req.query.pagina
    const query_limit = req.query.limit
    // se pagina e/o limit sono  undefined imposto la prima di default 
    let pagina = parseInt(query_pagina) || 1
    const limit = parseInt(query_limit) || 10
    // intercetto valori inferiori a 1
    if (pagina < 1) {
        pagina = 1
    }
    if (limit < 1) {
        limit = 10
    }
    const skip_lementi = (pagina - 1) * limit

    try {
        let where = {
            // escludo utente loggato
            id: { not: mio_id }
        }

        // Solo gli admin possono filtrare per questi stati
        if (req.isAdmin) {
            if (richiesta_eliminazione !== undefined) {
                // Converte "true" -> true, "false" -> false
                where.richiesta_eliminazione = richiesta_eliminazione === 'true'
            }
            if (bannato !== undefined) {
                where.bannato = bannato === 'true'
            }
        }

        if (q) {
            // elimino spazi bianchi
            const query_string = q.trim()
            // verifico se query_string è un numero (usato nella ricerca tramite ID)
            const is_q_numero = !isNaN(query_string) && query_string !== ''

            // costruisco filtro dinamico where, diffenziando tra admin e user
            if (req.isAdmin) {
                // admin
                if (is_q_numero) {
                    // se query_string è un numero sicuramente è un id da ricercare
                    where.id = parseInt(query_string)
                } else {
                    where.OR = [
                        // username like %query_string%
                        { username: { contains: query_string, mode: 'insensitive' } },
                        { cognome: { contains: query_string, mode: 'insensitive' } },
                        { nome: { contains: query_string, mode: 'insensitive' } },
                        { email: { contains: query_string, mode: 'insensitive' } },
                        { ruolo: { contains: query_string, mode: 'insensitive' } },                        
                    ]
                }
            } else {
                // utente
                if (!is_q_numero) {
                    where.username = { contains: query_string, mode: 'insensitive' }
                } else {
                    return res.status(401).json({ error: "Non sei autorizzato alla ricerca tramite ID" })
                }
            }
        }

        const [utenti, conteggioTotale] = await prisma.$transaction([
            prisma.utenti.findMany({
                //clausola where dinamicamente costruita in precedenza
                where,
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    avatar_thumb: true,
                    visualizzazioni: true,
                    biografia: true,
                    valutazioni_ricevute: true, //{select : {voto: true}},
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
                orderBy: { username: 'asc' },
                take: limit,
                skip: skip_lementi
            }),
            prisma.utenti.count({ // Query per il conteggio
                where
            })
        ])
        return res.status(200).json({
            message: "Utenti trovati",
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            data: utenti
        })

    } catch (err) {
        logger.error('['+ req.ip +'] Errore getAllUtenti -> : Errore generico ',err)
        console.error('Errore "getAllUtenti":', err)
        return res.status(500).json({ error: "Errore server" })
    }

}

/*
Restituisce il profilo dell'utente loggato oppure tramite id. Differenziazione tra
admin (oppure utente loggato) e altri utenti
*/
export const getProfilo = async (req, res) => {
    //console.log('controllo profilo')

    //recupero valori passati da middleware auth
    const targetId = req.targetId //controller auth stabilisce se esiste un parametro oppure se usare utente loggato
    const mio_id = req.userId
    const isAdmin = req.isAdmin

    try {
        //query per recupero utente
        const utente = await prisma.utenti.findUnique({
            where: { id: targetId },
            select: {
                id: true,
                username: true,
                avatar: true,
                avatar_thumb: true,
                visualizzazioni: true,
                biografia: true,
                email: true,
                ...(targetId === mio_id || isAdmin ? {
                    nome: true,
                    cognome: true,
                    bannato: true,
                    ruolo: true,
                    data_creazione: true,
                    data_ultima_modifica: true,
                    richiesta_eliminazione: true,
                    data_richiesta_eliminazione: true,
                } : {}) // se non è admin oppure utente loggato, mostra solo informazioni pubbliche            
            }
        })

        if (!utente) {
            res.status(404).json({ error: 'Utente non trovato' })
        }

        //console.log(utente)
        //incremento visualizzazioni utente (se profilo visitato è diverso dal suo)
        if (targetId !== mio_id) {
            const utenteVisualizzazioneUpdated = await prisma.utenti.update({
                data: { visualizzazioni: { increment: 1 } },
                where: { id: targetId }
            })
            utente.visualizzazioni = utenteVisualizzazioneUpdated.visualizzazioni
        }
        //console.log(utente)

        return res.status(200).json({message: 'Profilo recuperato con successo', data: utente})

    } catch (err) {
        logger.error('['+ req.ip +'] Errore getProfilo -> : Errore generico ',err)
        console.error('Errore "getProfilo":', err)
        return res.status(500).json({ error: "Errore server" })

    }
}



//Consente la modifica del profilo utente. Admin può modificare anche i parametri bannato e ruolo
export const updateUtente = async (req, res) => {

    //recupero valori passati da middleware auth
    const targetId = req.targetId // auth stabilisce se esiste un parametro oppure se usare utente loggato
    const mio_id = req.userId
    const isAdmin = req.isAdmin
    //console.log("IS ADMIN", isAdmin)

    //uso i dati già validati da Joi tramite validator utenteValidator
    let data = { ...req.dati_validati }
    //console.log(data)
    let vecchi_path_files = null // Variabile per i path degli avatar da eliminare

    //verifica autorizzazione all'update
    const isAutorizzato = isAdmin || (targetId === mio_id) // o sono admi oppure sto aggiornando il mio profilo

    if (!isAutorizzato) {
        // Se non è autorizzato, restituisci immediatamente l'errore 403.
        logger.warn(`[${req.ip}] L'utente id:${mio_id} ha tentato di aggiornare il profilo id:${targetId} senza autorizzazione. Richiesta bloccata`)
        return res.status(403).json({ error: `Non hai le autorizzazioni per modificare un altro profilo` })
    }

    //rimuovo il campo type dall'oggetto.. è utile solo per l'upload dell'immagine ma non fa parte dei campi db
    if (data.type) {
        //destrutturazione
        const { type, ...dati_puliti } = data
        // sovrascrivo oggetto data con i dati effettivamente aggiornabili
        data = dati_puliti
    }

    //gestione upload immagine (fileRidimensionato è restituito dal middleware uploadImgERidimensiona)
    if (req.fileRidimensionato) {

        // rimuovo vecchie immagini
        try {
            // cerco i vecchi path registratti nel db
            vecchi_path_files = await prisma.utenti.findUnique({
                where: { id: targetId },
                select: { avatar: true, avatar_thumb: true }
            })

        } catch (err) {
            // non bloccante, in caso di mancata eliminazione immagine
            console.warn(`Errore nel recupero vecchi path utente ${targetId}:`, err)
            logger.warn("["+ req.ip +"] Non è stato possibile rimuovere vecchie immagini", err)

        }
        data.avatar = req.fileRidimensionato.main
        data.avatar_thumb = req.fileRidimensionato.thumb
    }

    // Se non c'è nulla da aggiornare, risposta anticipata (dopo aver gestito l'eliminazione del type)
    if (Object.keys(data).length === 0) {
        return res.json({ message: 'Niente da aggiornare' })
    }

    if (data.hashed_password) {
        const hashed = await bcrypt.hash(data.hashed_password, 12)
        data.hashed_password = hashed
    }

    let utenteAggiornato

    try {
        // eseguo aggiornamento prima della cacellazione delle immagini vecchie in modo che
        // se dovessero insorgere problemi il try salterebbe al catch saltando la cancellazione delle immagini 
        utenteAggiornato = await prisma.utenti.update({
                where: { id: targetId },
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
                    ...(isAdmin && { ruolo: true, bannato: true, richiesta_eliminazione: true })

                }
            })
        
        //cancellazione delle vecchie immagini per evitare di avere file orfani
        if (req.fileRidimensionato && vecchi_path_files) {

            const filesToDelete = [vecchi_path_files.avatar, vecchi_path_files.avatar_thumb].filter(Boolean)

            filesToDelete.forEach(url => {
                const file_path = path.join(process.cwd(), url)

                fs.unlink(file_path, err => {
                    if (err && err.code !== 'ENOENT') {
                        // Log errore non bloccante. Se il file fisico è già sparito per qualche motivo, 
                        // non lo considero un errore critico è un "File Not Found" ma l'obiettivo di non averlo più è comunque raggiunto
                        console.error("ATTENZIONE: Non è stato possibile rimuovere vecchie immagini: File o directory non trovata", err)
                        logger.warn("["+ req.ip +"] Non è stato possibile rimuovere vecchie immagini: File o directory non trovata")
                    }
                })
            })
        }

        logger.info("["+ req.ip +"] L'utente id:" + mio_id + " ha aggiornato il profilo id:" + targetId)
        return res.status(200).json({ message: `Profilo ${targetId} aggiornato`, data: utenteAggiornato })

    } catch (err) {
        logger.error('['+ req.ip +'] Errore updateProfilo -> : Errore generico ', err)
        console.error('Errore "updateProfilo":', err)
        return res.status(500).json({ error: "Errore server" })

    }
}


/* 
Consente il softDelete dell'utente, una volta richiestol'utente verrà oscurato in attesa di eliminazione definitiva dall'admin
Solo l'utente stesso può richiedere la cancellazione o revocarla.
 */
export const softDeleteUtente = async (req, res) => {
    const mio_id = req.userId
    let data = { ...req.dati_validati }

    try {
        // Essendo un operazione che solo l'utnte loggato può fare su se stesso, procedo direttamente 
        //con update in quanto non necessario controllo esistenza utente
        const utente = await prisma.utenti.update({
            where: { id: mio_id },
            data: { 
                richiesta_eliminazione: data.richiesta_eliminazione,
                data_richiesta_eliminazione:data.data_richiesta_eliminazione
            },
            select: {
                id: true,
                username: true,
                richiesta_eliminazione: true,
                data_richiesta_eliminazione: true
            }
        })
        return res.status(200).json({ message: "Richiesta di eliminazione inviata con successo", data: utente })
    } catch (err) {
        logger.error('['+ req.ip +'] Errore softDelete -> : Errore generico ',err)
        console.error('Errore "softDelete":', err)
        return res.status(500).json({ error: "Errore server" })
    }
}


/* 
Questa funzionalità è riservata agli admin che possono cancella definitivamente un utente,
sempre che quest'ultimo abbia flaggato richietsa_eliminazione a true
*/
export const deleteUtente = async (req, res) => {

    const isAdmin = req.isAdmin
    const targetId = req.targetId
    const mio_id = req.userId
    const mioUsername = req.userUsername

    // doppio controllo di sicurezza, utente loggato admin e controllo che non elimini se stesso
    if (isAdmin && targetId !== mio_id) {
        try {
            // verifico esistenza utente e se ha richiesto eliminazione
            const utente = await prisma.utenti.findUnique({
                where: { id: targetId },
                select: { username: true, richiesta_eliminazione: true, avatar: true, avatar_thumb: true }
            })
            
            if (!utente) {
                return res.status(404).json({ error: "Utente non trovato" })
            }

            if (!utente.richiesta_eliminazione) {
                return res.status(400).json({ error: "Richiesta di eliminazione non presente per l'utente id:" + targetId })
            }

            logger.warn("["+ req.ip +"] L'utente con id:" + mio_id + " sta per eliminare l'account id:" + targetId)

            //cancellazione dal database
            // se transazione fallisce, esegue ROLLBACK e solleva eccezione e salta al blocco catch
            await prisma.$transaction(async (tx) => {
                // Elimina il record dal database. Se questo fallisce, l'intera transazione fallisce 
                await tx.utenti.delete({
                    where: { id: targetId }
                })
                // eseguo anche la creazione di un record di audit dedicato alle eliminazioni
                await tx.storico_eliminazioni.create({
                    data: {
                        esecutore_id: mio_id,
                        esecutore_username: mioUsername,
                        target_ID: targetId,
                        target_nome: utente.username,
                        azione: TipiAzione.DELETE_UTENTE
                    }
                })
            })

            //ELIMINAZIONE AVATAR dal disco fisso
            if (utente.avatar || utente.avatar_thumb) {
                const filesToDelete = [utente.avatar, utente.avatar_thumb].filter(Boolean)
                //procedo all'eliminazione
                filesToDelete.forEach(url => {
                    if (url) {
                        const file_path = path.join(process.cwd(), url)
                        fs.unlink(file_path, err => {
                            if (err && err.code !== 'ENOENT') {
                                console.error("Non è stato possibile rimuovere vecchie immagini")
                                logger.warn("["+ req.ip +"] Non è stato possibile rimuovere vecchie immagini")
                            }
                        })
                    }
                })
            }

            logger.warn("["+ req.ip +"] L'utente con id:" + mio_id + " HA ELIMINATO l'account id:" + targetId)
            return res.status(200).json({ message: "Utente eliminato definitivamente con successo" })

        } catch (err) {
            logger.error('['+ req.ip +'] Errore deleteUtente -> : Errore generico ',err)
            console.error('Errore "deleteUtente":', err)
            return res.status(500).json({ error: "Errore server - Cancellazione utente" })
        }
    } else {
        logger.warn("["+ req.ip +"] L'utente con id:" + mio_id + " ha tentato di eliminare l'account id:" + targetId + "senza averne autorizzazione. Richiesta bloccata")
        return res.status(401).json({ error: "Attensione solo gli utenti Admin possono procedere con l'eliminazione" })
    }
}
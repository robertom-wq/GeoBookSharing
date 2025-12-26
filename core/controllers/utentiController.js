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
import { TipiAzione } from '@prisma/client'

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

    try {
        let where = {
            // escludo utente loggato
            id: { not: mioId }
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
                        { username: { contains: queryString, mode: 'insensitive' } },
                        { cognome: { contains: queryString, mode: 'insensitive' } },
                        { nome: { contains: queryString, mode: 'insensitive' } },
                        { email: { contains: queryString, mode: 'insensitive' } },
                        { ruolo: { contains: queryString, mode: 'insensitive' } }
                    ]
                }
            } else {
                // utente
                if (!isQueryStringANumber) {
                    where.username = { contains: queryString, mode: 'insensitive' }
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
                skip: skipElementi
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
        logger.error('Errore getAllUtenti -> : Errore generico')
        console.error('Errore "getAllUtenti":', err)
        return res.status(500).json({ error: "Errore server" })
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
            where: { id: targetId },
            select: {
                id: true,
                username: true,
                avatar: true,
                avatar_thumb: true,
                visualizzazioni: true,
                biografia: true,
                email: true,
                ...(targetId === mioId || isAdmin ? {
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

        //incremento visualizzazioni utente (se profilo visitato è diverso dal suo)
        if (targetId !== mioId) {
            const utenteVisualizzazioneUpdated = await prisma.utenti.update({
                data: { visualizzazioni: { increment: 1 } },
                where: { id: targetId }
            })
            utente.visualizzazioni = utenteVisualizzazioneUpdated.visualizzazioni;
        }
        console.log(utente)

        return res.status(200).json({message: 'Profilo recuperato con successo', utente: utente});

    } catch (err) {
        logger.error('Errore getProfilo -> : Errore generico')
        console.error('Errore "getProfilo":', err)
        return res.status(500).json({ error: "Errore server" })

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
    let data = { ...req.dati_validati }
    console.log(data)
    let vecchi_path_file = null; // Variabile per i path da eliminare

    //verifica autorizzazione
    const isAutorizzato = isAdmin || (targetId === mioId)

    if (!isAutorizzato) {
        // Se non è autorizzato, restituisci immediatamente l'errore 403.
        logger.warn(`L'utente id:${mioId} ha tentato di aggiornare il profilo id:${targetId} senza autorizzazione. Richiesta bloccata`)
        return res.status(403).json({ error: `Non hai le autorizzazioni per modificare un altro profilo` })
    }

    //rimuovo il campo type dall'oggetto.. è utile solo per l'upload dell'immagine ma non fa parte dei campi db
    if (data.type) {
        //destrutturazione
        const { type, ...dati_puliti } = data
        // sovrascrivo oggetto data con i dati effettivamente aggiornabili
        data = dati_puliti
    }

    ///////////////aggiornamento: gestione upload immagine /////////
    if (req.fileRidimensionato) {

        // rimoziono vecchie immagini
        try {
            // cerco i vecchi path
            const vecchi_path = await prisma.utenti.findUnique({
                where: { id: targetId },
                select: { avatar: true, avatar_thumb: true }
            })

        } catch (err) {
            // non bloccante, in caso di mancata eliminazione immagine
            console.warn(`Errore nel recupero vecchi path utente ${targetId}:`, err)
            logger.warn("Non è stato possibile rimuovere vecchie immagini")

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
        utenteAggiornato = await prisma.$transaction(async (tx) => {
            return await prisma.utenti.update({
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
        })

        if (req.fileRidimensionato && vecchi_path_file) {

            const filesToDelete = [vecchi_path_file.avatar, vecchi_path_file.avatar_thumb].filter(Boolean);

            filesToDelete.forEach(url => {
                const file_path = path.join(process.cwd(), url);

                fs.unlink(file_path, err => {
                    if (err && err.code !== 'ENOENT') {
                        // Logghiamo l'errore non bloccante
                        console.error("ATTENZIONE: Non è stato possibile rimuovere vecchie immagini:", err);
                        logger.warn("Non è stato possibile rimuovere vecchie immagini");
                    }
                });
            });
        }

        logger.info("L'utente id:" + mioId + " ha aggiornato il profilo id:" + targetId)
        return res.status(200).json({ message: `Profilo ${targetId} aggiornato`, data: utenteAggiornato })

    } catch (err) {
        logger.error('Errore updateProfilo -> : Errore generico')
        console.error('Errore "updateProfilo":', err)
        return res.status(500).json({ error: "Errore server" })

    }
}


/* 
Consente il softDelete dell'utente, una volta richiestol'utente verrà oscurato in attesa di eliminazione definitiva dall'admin
Solo l'utente stesso può richiedere la cancellazione o revocarla.
 */

export const softDeleteUtente = async (req, res) => {
    const mioId = req.userId
    let data = { ...req.dati_validati }

    try {
        const utente = await prisma.utenti.update({
            where: { id: mioId },
            data: { richiesta_eliminazione: data.richiesta_eliminazione },
            select: {
                id: true,
                username: true,
                richiesta_eliminazione: true,
                data_richiesta_eliminazione: true
            }
        })
        return res.status(200).json({ message: "Richiesta di eliminazione inviata con successo", utente })
    } catch (err) {
        logger.error('Errore softDelete -> : Errore generico')
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
    const mioId = req.userId
    const mioUsername = req.userUsername

    if (isAdmin && targetId !== mioId) {
        try {
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

            logger.warn("L'utente con id:" + mioId + " sta per eliminare l'account id:" + targetId)

            //cancellazione dal database
            // se transazione fallisce, esegue ROLLBACK e solleva eccezione e salta al blocco catch
            await prisma.$transaction(async (tx) => {
                // Elimina il record dal database. Se questo fallisce, l'intera transazione fallisce 
                await tx.utenti.delete({
                    where: { id: targetId }
                })
                await tx.storico_eliminazioni.create({
                    data: {
                        esecutore_id: mioId,
                        esecutore_username: mioUsername,
                        target_ID: targetId,
                        target_nome: utente.username,
                        azione: TipiAzione.DELETE_UTENTE
                    }
                })
            })

            /////////// aggiornamento: implementare ELIMINAZIONE AVATAR dal disco fisso/////////////
            if (utente.avatar || utente.avatar_thumb) {
                const filesToDelete = [utente.avatar, utente.avatar_thumb].filter(Boolean);
                //procedo all'eliminazione
                filesToDelete.forEach(url => {
                    if (url) {
                        const file_path = path.join(process.cwd(), url)
                        fs.unlink(file_path, err => {
                            if (err && err.code !== 'ENOENT') {
                                console.error("Non è stato possibile rimuovere vecchie immagini")
                                logger.warn("Non è stato possibile rimuovere vecchie immagini")
                            }
                        })
                    }
                })
            }
            /////////// fine aggiornamento: implementare ELIMINAZIONE AVATAR dal disco fisso/////////////

            logger.warn("L'utente con id:" + mioId + " HA ELIMINATO l'account id:" + targetId)
            return res.status(200).json({ message: "Utente eliminato definitivamente con successo" })

        } catch (err) {
            logger.error('Errore deleteUtente -> : Errore generico')
            console.error('Errore "deleteUtente":', err)
            return res.status(500).json({ error: "Errore server - Cancellazione utente" })
        }
    } else {
        logger.warn("L'utente con id:" + mioId + " ha tentato di eliminare l'account id:" + targetId + "senza averne autorizzazione. Richiesta bloccata")
        return res.status(401).json({ error: "Attensione solo gli utenti Admin possono procedere con l'eliminazione" })
    }
}
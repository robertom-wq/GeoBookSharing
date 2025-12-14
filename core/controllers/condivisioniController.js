import prisma from "../config/prisma.js"
import { TipiAzione } from "@prisma/client"
import logger from "../config/logging.js"

/*
Creazione di una richiesta di prestito/condivisione
*/
export const creaRichiestaCondivisione = async (req, res) => {
    const richiedenteId = req.userId
    const dati_validati = { ...req.dati_validati };
    const today = new Date()

    // verifico che il libro esista e sia disponibile
    const libro_ricercato = await prisma.libri.findUnique({
        where: { id: dati_validati.libro_id },
    })
    if (!libro_ricercato) {
        return res.stauts(404).json({ error: `Libro id:${dati_validati.libro_id} non trovato` })
    }

    // altri controlli
    if (richiedenteId === libro_ricercato.proprietario_id) {
        return res.status(400).json({ error: 'Non puoi richiedere un tuo stesso libro' })
    }
    let nuovaCondivisione;
    try {
        //uso una transazione per prevenire la Race Condition.
        //Se la condizione di findFirst è falsa al momento della creazione 
        //(perché nel frattempo un'altra transazione ha concluso), l'intera transazione fallisce, prevenendo il doppio booking
        const nuovaCondivisione = await prisma.$transaction(async (tx) => {
            // verifico sovrapposizioni di date richieste con quelle confermate
            const condivisioneSovrapposta = await tx.condivisioni.findFirst({
                where: {
                    libro_id: libro_ricercato.id,
                    AND: [
                        // Condizione 1: data_al (esistente) deve essere >= data_dal (richiesto) (B >= C)
                        {
                            data_al: {
                                gt: dati_validati.data_dal, // gte = Greater Than or Equal
                            }
                        },
                        // Condizione 2: data_dal (esistente) deve essere <= data_al (richiesto) (A <= D)
                        {
                            data_dal: {
                                lt: dati_validati.data_al, // lte = Less Than or Equal
                            }
                        },
                    ]
                }
            })
            if (condivisioneSovrapposta) {
                //l'intervallo non è libero.
                throw new Error("CONFLITTO_DATE")

            }
            // creazione della condivisione
            return await prisma.condivisioni.create({
                data: {
                    libro: {
                        connect: { id: dati_validati.libro_id }
                    },

                    proprietario: {
                        connect: { id: libro_ricercato.proprietario_id }
                    },
                    richiedente: {
                        connect: { id: richiedenteId }
                    },
                    tipo_condivisione: {
                        connect: { id: dati_validati.tipo_condivisione_id }
                    },
                    data_dal: dati_validati.data_dal ? new Date(dati_validati.data_dal) : null,
                    data_al: dati_validati.data_al ? new Date(dati_validati.data_al) : null,
                    note: dati_validati.note
                },
                include: {
                    libro: { select: { id: true, titolo: true, copertina: true, copertina_thumb: true } },
                    richiedente: { select: { username: true, avatar: true, avatar: true, avatar_thumb: true } },
                    tipo_condivisione: { select: { dettagli: true } }
                }
            })

        })
    } catch (error) {
        if (error.message === "CONFLITTO_DATE") {
            return res.status(409).json({ error: "L'intervallo richiesto si sovrappone o è incluso in una condivisione esistente." })
        }
        logger.error('Errore creaRichiestaCondivisione -> : Errore generico')
        console.error('Errore "creaRichiestaCondivisione":', err)
        return res.status(500).json({ error: "Errore server - Impossibile processare la richiesta di condivisione" })
    }







    return res.status(200).json({ message: `Richiesta inviata con successo`, condivisione: nuovaCondivisione })
}

/*
Conferma/rifiuta richiesta di prestito/condivisione
*/
export const aggiornaStatoCondivisione = async (req, res) => {
    const targetId = parseInt(req.targetId)
    const mioId = req.userId

    const dati_validati = { ...req.dati_validati }

    //verifico l'esistenza della condivisione e che appartenga all'utente loggato
    const condivisione = await prisma.condivisioni.findUnique({
        where: { id: targetId },
        select: {
            id: true,
            proprietario_id: true,
            is_confermato: true,
            is_completato: true,
            libro_id: true
        }
    })

    if (!condivisione) {
        return res.status(404).json({ error: `Condivisione con id:${targetId} non travata` })
    }

    if (condivisione.proprietario_id !== mioId) {
        logger.warn(`L'utente id:${mioId} ha tentato di aggiornare lo stato di una condivisione di un libro senza autorizzazione. Richiesta bloccata`)
        return res.status(403).json({ error: 'Non sei il proprietario del libro' })
    }

    if (condivisione.is_completato || condivisione.is_confermato) {
        return res.status(400).json({ error: `Condivisione con id:${targetId} già processata` })
    }

    try {
        let data = {}
        let is_accettata
        if (dati_validati.azione === 'accetta') {
            data = { is_confermato: true, note: null }
            is_accettata = true
        } else if (dati_validati.azione === 'rifiuta') {
            data = { is_completato: true, note: `[Rifiutata dal proprietario] ${dati_validati.note}`, data_completato: new Date() }
            is_accettata = false
        }

        const aggiornata = await prisma.condivisioni.update({
            where: { id: targetId },
            data,
        })

        return res.status(200).json({ message: is_accettata ? 'Richiesta Accetta' : 'Richiesta rifiutata', aggiornata })

    } catch (err) {
        logger.error('Errore aggiornaStatoCondivisione -> : Errore generico')
        console.error('Errore "aggiornaStatoCondivisione":', err)
        return res.status(500).json({ error: "Errore server - Impossibile processare lo stato della condivisione" })
    }
}

/*
Concludi prestisto/condivisione una volta restituito il libro
*/
export const concludiPrestito = async (req, res) => {
    const targetId = req.targetId
    const mioId = req.userId

    try {
        // cerco la condivisione
        const condivisione = await prisma.condivisioni.findUnique({
            where: { id: targetId },
            include: { libro: { select: { id: true, proprietario_id: true } } }
        })
        if (!condivisione) {
            return res.status(404).json({ error: `Condivisione con id:${targetId} non travata` })
        }
        // solo il proprietario può concludere
        if (condivisione.libro.proprietario_id !== mioId) {
            logger.warn(`L'utente id:${mioId} ha tentato di concludere una condivisione di un libro senza autorizzazione. Richiesta bloccata`)
            return res.status(400).json({ error: 'Non sei il proprietario del libro. Non puoi concludere la condivisione' })
        }

        // la condivisione deve essere confermata ma non completata
        if (!condivisione.is_confermato) {
            return res.status(400).json({ error: `Il prestito con id:${targetId} non è stato ancora confermato. Conferma e poi concludi` })
        }

        if (condivisione.is_completato) {
            return res.status(400).json({ error: `Il prestito con id:${targetId} è già stato completato` })
        }

        // update
        const condivione_conclusa = await prisma.condivisioni.update({
            where: { id: targetId },
            data: { is_completato: true, data_completato: new Date() }
        })
        return res.status(200).json({ message: "Condivisione completata con successo" })

    } catch (err) {
        logger.error('Errore concludiPrestito -> : Errore generico')
        console.error('Errore "concludiPrestito":', err)
        return res.status(500).json({ error: "Errore server - Impossibile concludere la condivisione" })
    }
}

/*
Elimina un prestito/condivisione
*/
export const deleteCondivisione = async (req, res) => {
    const targetId = req.targetId
    const mioId = req.userId
    const mioUsername = req.userUsername
    const motivo = req.dati_validati.motivo

    try {
        // verifico esistenza della condivisione
        const condivisione = await prisma.condivisioni.findUnique({
            where: { id: targetId },
            select: {
                id: true,
                richiedente_id: true,
                proprietario_id: true,
                is_confermato: true,
                is_completato: true,
                libro_id: true
            }
        })

        if (!condivisione) {
            return res.status(404).json({ error: `La condivisione con id:${targetId} non è stata trovata` })
        }

        // creo le regole di eliminazione
        const isRichiedente = condivisione.richiedente_id === mioId
        const isProprietario = condivisione.proprietario_id === mioId
        if (!isRichiedente && !isProprietario) {
            return res.status(403).json({error: `Non sei autorizzato ad eliminare la condivisione con id:${targetId}.`})
        }

        // La condivisione sarà eliminabile se è conclusa, oppure se non ancora confermata dal proprietario.
        const isEliminabile = !condivisione.is_confermato || condivisione.is_completato
        console.log("Eliminabile?",condivisione.is_completato)
        if (!isEliminabile) {
            return res.status(403).json({ error: `Non puoi eliminare una condivisione in corso (confermata e non completata)` })
        }

        await prisma.$transaction(async (tx) => {
            // Elimina il record dal database. Se questo fallisce, l'intera transazione fallisce .
            await tx.condivisioni.delete({
                where: { id: targetId }
            });
            await tx.storico_eliminazioni.create({
                data: {
                    esecutore_id: mioId,
                    esecutore_username: mioUsername,
                    target_ID: targetId,
                    target_nome: `Condivisione tra p:${condivisione.proprietario_id} ed r:${condivisione.richiedente_id} del libro:${condivisione.libro_id}. Motivazione: ${motivo || null}`,
                    azione: TipiAzione.DELETE_CONDIVISIONE
                }
            })
        });

        return res.status(200).json({message: `La condivisione con id:${targetId} è stata eliminata`, motivo: motivo || null})

    } catch (err) {
        logger.error('Errore deleteCondivisione -> : Errore generico')
        console.error('Errore "deleteCondivisione":', err)
        return res.status(500).json({ error: `Errore server - Impossibile eliminare le mie condivisioni` })
    }

}

/*
Restituisce i miei prestiti in qualità di richiedente/proprietario in base al param ruolo=richiedente/proprietario
*/
export const getMieCondivisioni = async (req, res) => {
    const mioId = req.userId
    const ruolo = req.query.ruolo

    // utilizzo la paginazione, il risultato potrebbe contenere parecchi elementi
    // vedo se nella req esiste una query con pagina e limit
    const queryPagina = req.query.pagina
    const queryLimit = req.query.limit
    console.log(ruolo)
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
        let where
        if (ruolo) {
            console.log("ruolo", ruolo)
            if (ruolo === 'proprietario') {
                where = { proprietario_id: mioId }
            } else if (ruolo === 'richiedente') {
                where = { richiedente_id: mioId }
            } else {
                return res.status(400).json({ message: "Il ruolo deve essere 'proprietario' oppure 'richiedente" })
            }
        } else {
            where = {
                OR: [
                    { proprietario_id: mioId },
                    { richiedente_id: mioId }
                ]
            }
        }


        const [richieste, conteggioTotale] = await prisma.$transaction([
            prisma.condivisioni.findMany({
                where,
                include: {
                    libro: { select: { titolo: true, copertina: true, copertina_thumb: true } },
                    proprietario: { select: { id: true, username: true, avatar: true, avatar_thumb: true } },
                    richiedente: { select: { id: true, username: true, avatar: true, avatar_thumb: true } },
                    tipo_condivisione: { select: { dettagli: true } },
                    //aggiungere recensione utente una volta implementata
                },
                orderBy: { data_creazione: 'desc' },
                take: limit,
                skip: skipElementi
            }),
            prisma.condivisioni.count({ // Query per il conteggio
                where
            })

        ])


        return res.status(200).json({
            message: `Mie condivisioni (${ruolo ? ruolo : 'Tutte'})`,
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            data: richieste
        })
    } catch (err) {
        logger.error('Errore getMieCondivisioniRichiedente -> : Errore generico')
        console.error('Errore "getMieCondivisioniRichiedente":', err)
        return res.status(500).json({ error: `Errore server - Impossibile visualizzare le mie condivisioni (${ruolo ? ruolo : 'Tutte'}` })
    }

}
import prisma from '../config/prisma.js'
import logger from '../config/logging.js'


/*
crea uan nuova valutazione (bidirezionale per una condivisione due valutazioni, una del proprietario e una del richiedente)
*/
export const creaValutazione = async (req, res) => {
    const mioId = req.userId
    const mioUsername = req.userUsername
    const dati_validati = req.dati_validati

    // verifico sulla richiesta che valutatore e valutato siano differenti
    /*     if (dati_validati.recensito_id === dati_validati.recensore_id) {
            return res.status(403).json({ error: `Non puoi rilasciare una valutazione su te stesso` })
        } */

    //cerco condivisione da valutare
    const condivisione = await prisma.condivisioni.findUnique({
        where: { id: dati_validati.condivisione_id }
    })

    if (!condivisione) {
        return res.status(404).json({ error: `Condivisione id:${dati_validati.condivisione_id} non trovata` })
    }

    if (mioId !== condivisione.proprietario_id && mioId !== condivisione.richiedente_id) {
        logger.warn(`L'utente con id:${mioId} (${mioUsername}), ha tentato di rilasciare una valutazione per la condivisione id:${dati_validati.condivisione_id}, per cui non è autorizzato. Richiesta bloccata`)
        return res.status(403).json({ error: `Non sei autorizzato a rilasciare  una valutazione per la condivisione id:${dati_validati.condivisione_id}` })
    }

    try {
        let recensito
        console.log(condivisione.proprietario_id, condivisione.richiedente_id, mioId)
        // se sono proprietario recensisco il richiedente
        if (condivisione.proprietario_id === mioId) {
            recensito = condivisione.richiedente_id
            // altrimenti se sono il richiedente recensisco proprietario
        } else if (condivisione.richiedente_id === mioId) {
            recensito = condivisione.proprietario_id
        }
        
        const nuovaValutazione = await prisma.utente_valutazioni.create({
            data: {
                recensore_id: mioId,
                recensito_id: recensito,
                condivisione_id: dati_validati.condivisione_id,
                voto: dati_validati.voto,
                recensione: dati_validati.recensione
            }
        })

        return res.status(201).json({ message: `Valtazione inserita con successo`, data: nuovaValutazione })
    } catch (err) {
        logger.error('Errore creaValutazione -> : Errore generico')
        console.error('Errore "creaValutazione":', err)
        return res.status(500).json({ error: "Errore server - Impossibile inserire la tua valutazione" })
    }

}

/*
Restituisce votazione media piu ultime 5 recensioni
*/
export const getVotazioneMediaUtente = async (req, res) => {
    console.log("Dentro getVotazioneMediaUtente")
    const targetId = req.targetId

    if (isNaN(targetId)) {
        return res.status(404).json({ error: 'Id utente non valido' })
    }

    try {
        // funzione di aggregazione per calcolare la media dei voti
        const aggregatore = await prisma.utente_valutazioni.aggregate({
            where: { recensito_id: targetId },
            _avg: { voto: true },
            _count: { voto: true }
        })

        const voto_medio = aggregatore._avg.voto
        const totale_voti = aggregatore._count.voto

        // recupero ultime 5 valutazioni per statistiche
        const valutazioni_recenti = await prisma.utente_valutazioni.findMany({
            where: { recensito_id: targetId },
            orderBy: { data_creazione: 'desc' },
            take: 5, // limite a 5 valutazioni recenti
            include: {
                recensore: { select: { id: true, username: true, avatar: true, avatar_thumb: true } },
                condivisione: {
                    select:
                    {
                        id: true,
                        libro: { select: { titolo: true, copertina: true, copertina_thumb: true, proprietario_id: true } },
                        proprietario: { select: { id: true, username: true } },
                        richiedente: { select: { id: true, username: true } }
                    }
                }
            }
        })

        return res.status(200).json({
            message: "Recupero valutazioni recenti riuscito", data: {
                utente_valutato: targetId,
                media_voto: voto_medio ? parseFloat(voto_medio).toFixed(2) : 0,
                totale_voti: totale_voti,
                valutazioni_recenti: valutazioni_recenti
            }
        })

    } catch (err) {
        logger.error('Errore getVotazioneMediaUtente -> : Errore generico')
        console.error('Errore "getVotazioneMediaUtente":', err)
        return res.status(500).json({ error: `Errore server - Impossibile visualizzare la valutazione` })
    }
}

/*
Tutte le valutazioni date e ricevute con filtro ruolo=recensore/recensito,
con pagination pagina=1
*/
export const getAllValutazioni = async (req, res) => {
    const mioId = req.userId
    const ruolo = req.query.ruolo?.trim().toLowerCase() || null
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
        // Imposto la where in base al ruolo che imposto sulla query
        let where
        let includeDinamico
        if (ruolo) {
            if (ruolo === 'recensore') {
                where = { recensore_id: mioId }
                includeDinamico = { recensito: { select: { username: true, avatar: true, avatar_thumb: true } } }
            } else if (ruolo === 'recensito') {
                where = { recensito_id: mioId }
                includeDinamico = { recensore: { select: { username: true, avatar: true, avatar_thumb: true } } }
            } else {
                return res.status(400).json({ message: "Il ruolo deve essere 'recensore' oppure 'recensito" })
            }
        } else {
            where = {
                OR: [
                    { recensore_id: mioId },
                    { recensito_id: mioId }
                ]
            }
            includeDinamico = { recensito: { select: { username: true, avatar: true, avatar_thumb: true }},
                                recensore: { select: { username: true, avatar: true, avatar_thumb: true }}}
        }
        console.log("WHERE finale:", where);
        const [valutazioni_all, conteggioTotale] = await prisma.$transaction([
            prisma.utente_valutazioni.findMany({
                where,
                include: {
                    condivisione: { select: { libro: { select: { titolo: true, copertina_thumb: true } }, data_completato: true } },
                    ...includeDinamico
                },
                orderBy: { data_creazione: 'desc' },
                take: limit,
                skip: skipElementi
            }),
            prisma.utente_valutazioni.count({ // Query per il conteggio
                where
            })

        ])

        return res.status(200).json({
            message: `Mie Valutazioni (${ruolo ? ruolo : 'Tutte'})`,
            paginaCorrente: pagina,
            elementiPerPagina: limit,
            conteggioTotale: conteggioTotale,
            pagineTotali: Math.ceil(conteggioTotale / limit),
            data: valutazioni_all
        })


    } catch (err) {
        logger.error('Errore getAllValutazioni -> : Errore generico')
        console.error('Errore "getAllValutazioni":', err)
        return res.status(500).json({ error: `Errore server - Impossibile visualizzare le mie valutazioni (${ruolo ? ruolo : 'Tutte'}` })
    }

}
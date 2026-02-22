import prisma from "../config/prisma.js"
import logger from "../config/logging.js"
import { Prisma, TipiAzione } from '@prisma/client' // Importa l'oggetto Prisma

/*
Creazione di uno scaffale, basato su posizione geografica, che andreà popolato con i vari libri
*/
export const createScaffale = async (req, res) => {
    const { nome, descrizione, lat, lng } = req.dati_validati
    const mioId = req.userId
    // Well-Known Text (WKT) è uno standard per rappresentare oggetti geometrici utilizzato da PostGIS
    //Singolo punto (POINT) più i parametri di longitudine e latitudine
    const punto_geografico = `POINT(${lng} ${lat})`


    try {
        //destructuring, $queryRaw restituisce i risultati sotto forma di un array do oggetti, usando [scaffale],
        // si evita di dover accedere ai singoli nome, descrizione etc senza usare una sintassi tipo
        //scaffale[0].nome 
        const [scaffale] = await prisma.$queryRaw`
        INSERT INTO scaffali (
            nome,
            descrizione,
            proprietario_id,
            posizione,
            data_ultima_modifica)
            VALUES (
                ${nome},
                ${descrizione || null},
                ${mioId},
                --cnverte un testo relativo a un punto geografico in un oggetto geometrico per PostGIS.
                --4326 è lo standard globale per i dati di lng e lat
                ST_GeomFromText(${punto_geografico}, 4326),
                NOW()
            )
            RETURNING
                id, nome, descrizione, COALESCE(ST_AsText(posizione), 'Nessuna Posizione') AS posizione, data_creazione, data_ultima_modifica
        `

        return res.status(201).json({ message: "Scaffale creato con successo", data: scaffale })
    } catch (err) {
        logger.error('['+ req.ip +'] Errore createScaffale -> : Errore generico ',err)
        console.error('Errore "createScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile creare lo scaffale" })
    }
}

/*
Aggiornamento di un proprio scaffale 
*/
export const updateScaffale = async (req, res) => {
    //recupero id dello scaffale da modificare dai parametri
    const id_scaffale = parseInt(req.params.id)

    const { nome, descrizione, lat, lng } = req.dati_validati
    const mioId = req.userId

    // verifico se id esiste ed è valido
    if (!id_scaffale || isNaN(id_scaffale)) {
        return res.status(400).json({ error: "ID scaffale NON valido" })
    }

    try {
        const scaffale = await prisma.scaffali.findUnique({
            where: { id: id_scaffale },
            select: { proprietario_id: true }
        })

        // verifico se esiste lo scaffale
        if (!scaffale) {
            return res.status(404).json({ error: `Scaffale ${id_scaffale} non trovato` })
        }
        //verifico la proprietà dello scaffale
        if (scaffale.proprietario_id != mioId) {
            return res.status(403).json({ error: `Non sei autorizzato alla modifica dello scaffale ${id_scaffale}` })
        }
        // aggiornamnto dati in due fasi, prima i dati standard e poi queryRaw per posizione
        const dati_in_aggiornamento = {}
        if (nome !== undefined) {
            dati_in_aggiornamento.nome = nome
        }
        if (descrizione !== undefined) {
            dati_in_aggiornamento.descrizione = descrizione
        }
        // procedo all'aggiornamento solamente se vi sono dati da aggiornare
        // prima fase
        if (Object.keys(dati_in_aggiornamento).length > 0) {
            await prisma.$transaction(async (tx) => {
                await tx.scaffali.update({
                    where: { id: id_scaffale },
                    data: dati_in_aggiornamento,
                })
            })
        }
        //seconda fase
        if (lat !== undefined && lng !== undefined) {
            const punto_geografico = `POINT(${lng} ${lat})`
            await prisma.$queryRaw`
            UPDATE scaffali 
            SET
                posizione =  ST_GeomFromText(${punto_geografico}, 4326)
            WHERE id = ${id_scaffale}
            `
            logger.info(`[${req.ip}] Posizione scaffale ${id_scaffale} aggiornata separatamente.`)
        }

        //ritorna lo scaffale con posizione
        const [scaffale_aggiornato] = await prisma.$queryRaw`
        SELECT
            id,
            nome,
            descrizione,
            COALESCE(ST_AsText(posizione), 'Nessuna Posizione') AS posizione,
            data_creazione,
            data_ultima_modifica
        FROM
            scaffali
        WHERE
            id=${id_scaffale}
        `

        return res.status(200).json({ message: `Scaffale ${id_scaffale} aggiornato con successo`, data: scaffale_aggiornato })


    } catch (err) {
        logger.error('['+ req.ip +'] Errore updateScaffale -> : Errore generico ',err)
        console.error('Errore "updateScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile aggiornare lo scaffale" })
    }

}

/*
Restituisce la lista di tutti gli scaffali personali 
*/
export const getMieiScaffali = async (req, res) => {
    const mioId = req.userId

    try {
        const scaffali = await prisma.$queryRaw`
            SELECT
                s.id,
                s.nome,
                s.descrizione,
                COALESCE(ST_AsText(posizione), 'Nessuna Posizione') AS posizione,
                s.data_creazione,
                s.data_ultima_modifica,
                COUNT (l.id) AS libri_totali,
                COUNT (l.id) FILTER (WHERE l.is_disponibile = true) AS libri_disponibili,
                -- json_agg(...) Funzione di Aggregazione per creare un campo JSON (libri_array)
                --che contiene solo l'elenco dettagliato dei libri attualmente posizionati nello scaffale.
                json_agg(
                        json_build_object(
                            'id', l.id,
                            'titolo', l.titolo,
                            'autore', l.autore,
                            'anno', l.anno,
                            'is_disponibile', l.is_disponibile
                        )
                ) FILTER (WHERE l.id IS NOT NULL) AS libri_array
            FROM scaffali s
            LEFT JOIN libri l ON l.scaffale_id = s.id
            WHERE s.proprietario_id = ${mioId}
            GROUP BY s.id
            ORDER BY s.data_creazione ASC
        `
        // preparo result
        const scaffali_da_restituire = scaffali.map(s => ({
            id: s.id,
            nome: s.nome,
            descrizione: s.descrizione || null,
            posizione: s.posizione,
            data_creazione: s.data_creazione,
            data_ultima_modifica: s.data_ultima_modifica,
            libri_totali: Number(s.libri_totali),
            libri_disponibili: Number(s.libri_disponibili),
            libri: (s.libri_array || []).filter(book => book != null)
        }))

        res.status(200).json({data: scaffali_da_restituire})

    } catch (err) {
        logger.error('['+ req.ip +'] Errore getMieiScaffali -> : Errore generico ', err)
        console.error('Errore "getMieiScaffali":', err)
        res.status(500).json({ error: "Errore server - Impossibile visualizzare scaffali personali" })
    }

}

/*
Eliminazione di uno scaffale di cui si è proprietario. Lo scaffale non può essere eliminato se
contiene libri. Prima vanno eliminati i libri
*/
export const deleteScaffale = async (req, res) => {
    const id_scaffale = parseInt(req.params.id)
    const mioId = req.userId
    const mioUsername = req.userUsername

    if (!id_scaffale || isNaN(id_scaffale)) {
        return res.status(400).json({ error: "ID scaffale NON valido" })
    }
    try {
        const [scaffale] = await prisma.$queryRaw`
        SELECT
            s.proprietario_id,
            COUNT (l.id) FILTER (WHERE l.is_disponibile = true) AS libri_disponibili
        FROM
            scaffali s
        LEFT JOIN libri l ON l.scaffale_id = s.id
        WHERE s.id = ${id_scaffale}
        GROUP BY s.proprietario_id        
        `
        // verifico se esiste lo scaffale
        if (!scaffale) {
            return res.status(404).json({ error: `Scaffale ${id_scaffale} non trovato` })
        }
        //verifico la proprietà dello scaffale
        if (scaffale.proprietario_id != mioId) {
            logger.warn(`[${req.ip}] L'utente con id:${mioId} ha tentato di eliminare lo scaffale id:${id_scaffale} senza autorizzazione. Richiesta bloccata`)
            return res.status(403).json({ error: `Non sei autorizzato all'eliminazione dello scaffale ${id_scaffale}` })
        }
        //verifico la presenza di libri
        if (Number(scaffale.libri_disponibili) > 0) {
            return res.status(409).json({ error: "Impossibile eliminare lo scaffale, contiene ancora dei libri. Eliminare prima i libri contenuti" })
        }

        //Delete
        await prisma.$transaction(async (tx) => {
            await tx.scaffali.delete({
                where: { id: id_scaffale }
            })
            await tx.storico_eliminazioni.create({
                data: {
                    esecutore_id: mioId,
                    esecutore_username: mioUsername,
                    target_ID: id_scaffale,
                    target_nome: id_scaffale.toString(),
                    azione: TipiAzione.DELETE_SCAFFALE
                }
            })
        })
        /*         await prisma.$queryRaw`
                DELETE FROM scaffali WHERE id = ${id_scaffale}
                ` */
        res.status(200).json({ message: `Lo scaffale ${id_scaffale} è stato eliminato con successo` })

    } catch (err) {
        logger.error('['+ req.ip +'] Errore deleteScaffale -> : Errore generico ', err)
        console.error('Errore "deleteScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile eliminare lo scaffale" })
    }
}

//restituisce scaffale tramite id
export const getScaffaleById = async (req, res) => {
    const id_scaffale = parseInt(req.params.id)
    const mioId = req.userId

    if (!id_scaffale || isNaN(id_scaffale)) {
        return res.status(400).json({ error: 'ID non valido' })
    }
    try {
        //verifico esistenza e proprietà scaffale
        const esiste_scaffale = await prisma.scaffali.findUnique({
            where: { id: id_scaffale },
            select: { proprietario_id: true }
        })
        if (!esiste_scaffale) {
            return res.status(404).json({ error: 'Scaffale non trovato' })
        }

        const [scaffale] = await prisma.$queryRaw`
        SELECT
            s.id,
            s.nome,
            s.descrizione,
            COALESCE(ST_AsText(s.posizione), 'Nessuna Posizione') AS posizione,
            s.data_creazione,
            s.data_ultima_modifica,
            u.id AS utente_id,
            u.username AS proprietario_username,
            u.avatar || u.avatar_thumb AS proprietario_avatar,
            COALESCE (
                    json_agg(
                        CASE
                            WHEN l.is_disponibile = true THEN 
                                json_build_object(
                                    'id', l.id,
                                    'titolo', l.titolo,
                                    'anno', l.anno,
                                    'autore',l.autore,
                                    'descrizione', l.descrizione,
                                    'copertina', l.copertina,
                                    'copertina_thumb', l.copertina_thumb,
                                    'is_disponibile', l.is_disponibile,
                                    'tipo_condivisione', json_build_object(
                                        'dettagli', t.dettagli
                                    ),
                                    'genere', json_build_object(
                                        'dettagli', g.dettagli
                                    )
                                )
                            ELSE NULL 
                        END 
                    ) FILTER (WHERE l.id IS NOT NULL), '[]' 
                ) AS libri
            FROM scaffali s
            LEFT JOIN utenti u ON u.id = s.proprietario_id
            LEFT JOIN libri l ON l.scaffale_id = s.id AND l.is_disponibile
            LEFT JOIN generi g ON g.id = l.genere_id
            LEFT JOIN tipi_condivisione t ON t.id = l.tipo_condivisione_id
            WHERE s.id = ${id_scaffale}
            GROUP BY s.id, u.username, u.id
        `
        if(!scaffale) {
            return res.status(404).json({error: 'Scaffale non trovato'})
        }

        const scaffale_da_restituire = {
            id: scaffale.id,
            nome: scaffale.nome,
            descrizione: scaffale.descrizione,
            posizione: scaffale.posizione,
            data_creazione: scaffale.data_creazione,
            data_ultima_modifica: scaffale.data_ultima_modifica,
            utente: {
                id: scaffale.utente_id,
                username: scaffale.proprietario_username,
                avatar: scaffale.proprietario_avatar
            },
            libri: scaffale.libri.filter(libro => libro != null)
        }

        return res.status(200).json({message: 'Scaffale recuperato con successo', data: scaffale_da_restituire})
    } catch (err) {
        logger.error('['+ req.ip +'] Errore getScaffaleById -> : Errore generico ',err)
        console.error('Errore getScaffaleById', err)
        return res.status(500).json({ error: 'Errore server - Impossibile completare la richiesta', err })
    }
}
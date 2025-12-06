import prisma from "../config/prisma.js"
import logger from "../config/logging.js"
import { Prisma } from '@prisma/client'; // Importa l'oggetto Prisma
/*
NOTE - RIMUOVERE E AGGIUNGERE IN TEMPLATE
Ho optato per l'uso di prisma.$queryRaw perchè Prisma non supporta nativamente i tipi di dati spaziali come geometry o geography
del PostGIS con i suoi metodi standard (.create(), .update(), ecc.)
Non ci sono alternative dirette con i metodi tipizzati di Prisma che consentano l'uso della funzione ST_GeomFromText()
 * /

import prisma from "../config/prisma.js"

/*
Creazione di uno scaffale, basato su posizione geografica, che andreà popolato con i vari libri
*/
export const createScaffale = async (req, res) => {
    const {nome, descrizione, lat, lng } = req.dati_validati
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

        return res.status(201).json({message: "Scaffale creato con successo", scaffale})
    } catch (err) {
        logger.error('Errore createScaffale -> : Errore generico')
        console.error('Errore "createScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile creare lo scaffale"})
    }
}

/*
Aggiornamento di un proprio scaffale 
*/
export const updateScaffale = async (req, res) => {
    //recupero id dello scaffale da modificare dai parametri
    const id_scaffale = parseInt(req.params.id)

    const {nome, descrizione, lat, lng } = req.dati_validati
    const mioId = req.userId
    const isAdmin = req.isAdmin

    // verifico se id esiste ed è valido
    if (!id_scaffale || isNaN(id_scaffale)) {
        return res.status(400).json({error: "ID scaffale NON valido"})
    }

    try {
        const scaffale = await prisma.scaffali.findUnique({
            where: { id: id_scaffale},
            select: { proprietario_id: true}
        })

        // verifico se esiste lo scaffale
        if(!scaffale) {
            return res.status(404).json({error: `Scaffale ${id_scaffale} non trovato`})
        }
        //verifico la proprietà dello scaffale
        if (scaffale.proprietario_id != mioId) {
            return res.status(403).json({error: `Non sei autorizzato alla modifica dello scaffale ${id_scaffale}`})
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
        if (Object.keys(dati_in_aggiornamento) > 0) {
            await prisma.scaffali.update({
                where: { id: id_scaffale},
                data: dati_in_aggiornamento
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

        res.status(200).json({message: `Scaffale ${id_scaffale} aggiornato con successo`})


    } catch (err) {
        logger.error('Errore updateScaffale -> : Errore generico')
        console.error('Errore "updateScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile aggiornare lo scaffale"})
    }

}

/*
Restituisce la lista di tutti gli scaffali personali 
*/
export const getMieiScaffali = async (req,res) => {
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
        const result = scaffali.map(s =>({
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

        res.status(200).json(result)

    } catch (err) {
        logger.error('Errore getMieiScaffali -> : Errore generico')
        console.error('Errore "getMieiScaffali":', err)
        res.status(500).json({ error: "Errore server - Impossibile visualizzare scaffali personali"})
    }

}

/*
Eliminazione di uno scaffale di cui si è proprietario. Lo scaffale non può essere eliminato se
contiene libri. Prima vanno eliminati i libri
*/
export const deleteScaffale = async (req, res) => {
    const id_scaffale = parseInt(req.params.id)
    const mioId = req.userId

    if (!id_scaffale || isNaN(id_scaffale)) {
         return res.status(400).json({error: "ID scaffale NON valido"})
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
        if(!scaffale) {
            return res.status(404).json({error: `Scaffale ${id_scaffale} non trovato`})
        }
        //verifico la proprietà dello scaffale
        if (scaffale.proprietario_id != mioId) {
            logger.warn(`L'utente con id:${mioId} ha tentato di eliminare lo scaffale id:${id_scaffale} senza autorizzazione. Richiesta bloccata`)
            return res.status(403).json({error: `Non sei autorizzato all'eliminazione dello scaffale ${id_scaffale}`})
        }
        //verifico la presenza di libri
        if (Number(scaffale.libri_disponibili) > 0) {
            res.status(409).json({error: "Impossibile eliminare lo scaffale, contiene ancora dei libri. Eliminare prima i libri contenuti"})
        }

        //Delete
        await prisma.$queryRaw`
        DELETE FROM scaffali WHERE id = ${id_scaffale}
        `
        res.status(200).json({message: `Lo scaffale ${id_scaffale} è stato eliminato con successo`})

    } catch (err) {
        logger.error('Errore deleteScaffale -> : Errore generico')
        console.error('Errore "deleteScaffale":', err)
        res.status(500).json({ error: "Errore server - Impossibile eliminare lo scaffale"})        
    }
}

/*
Ricerca di scaffali vicini ad una posizione in base ad una distanza
*/
export const getScaffaliVicini = async (req, res) => {
    const {lat, lng, dist=5000, q='' } = req.query

    const mioId = req.userId
    const lat_num = parseFloat(lat)
    const lng_num = parseFloat(lng)
    const dist_num = parseFloat(dist)
    // Preparazione della stringa di ricerca, trasformandola in minuscolo e aggiungendo i wildcards di PostgreSQL
    const termine_ricercato = `%${q.toLowerCase()}%`

    if (isNaN(lat_num) || isNaN(lng_num) || isNaN(dist_num)) {
        return res.status(400).json({ error: "Parametri non validi"})
    }

    try {
        const scaffali = await prisma.$queryRaw`
            SELECT
            s.id,
            s.nome,
            s.descrizione,
            COALESCE(ST_AsText(s.posizione), 'Nessuna Posizione') AS posizione,
            s.data_creazione,
            s.data_ultima_modifica,
            u.username AS proprietario_username,
            u.avatar || u.avatar_thumb AS proprietario_avatar,
            -- calcolo della distanza tra due punti di tipo geography,permette a PostGIS di calcolare la 
            -- distanza sulla superficie curva della Terra (metodo del grande cerchio), restituendo il risultato in metri.
            ST_Distance(
                s.posizione::geography,
                --crea il punto di riferimento (la posizione dell'utente che esegue la ricerca) e gli assegna il sistema di coordinate
                ST_SetSRID(ST_MakePoint(${lng_num}, ${lat_num}), 4326)::geography
            ) AS distanza_metri,
            COALESCE (
                json_agg(
                    CASE
                        WHEN l.is_disponibile = true THEN 
                            json_build_object(
                                'id', l.id,
                                'titolo', l.titolo,
                                'anno', l.anno,
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
            WHERE
                s.posizione IS NOT NULL
                AND s.proprietario_id != ${mioId} -- esclusione degli scaffali dell'utente loggato 
                --DWithin è la condizione di filtro principale. Restituisce solo gli scaffali la cui posizione
                --si trova entro la distanza specificata da $dist_num (in metri).
                AND ST_DWithin(
                    s.posizione::geography,
                    ST_SetSRID(ST_MakePoint(${lng_num}, ${lat_num}), 4326)::geography,
                    ${dist_num}
                )
            GROUP BY s.id, u.username, u.avatar, u.avatar_thumb
            ORDER BY distanza_metri ASC
            LIMIT 20          
        `

        // costruisco la response
        const result = scaffali.map(s => ({
            id: s.id,
            nom: s.nome,
            descrizione: s.descrizione || null,
            posizione: s.posizione,
            proprietario: {
                username: s.proprietario_username,
                avatar: s.proprietario_avatar
            },
            distanza_metri: Number(s.distanza_metri),
            distanza_km: (s.distanza_metri / 1000).toFixed(2),
            libri: s.libri.filter(book => book !== null)
    }))

    res.status(200).json({message: `Scaffali vicini trovati`,
        trovati : result.length,
        scaffali: result
    })

    } catch (err) {
        logger.error('Errore getScaffaliVicini -> : Errore generico')
        console.error('Errore "getScaffaliVicini":', err)
        res.status(500).json({ error: "Errore server - Impossibile completare la ricerca di scaffali vicini"})        
    }

}

/*
ricerca di scaffali tramite parametri (username proprietario, nome scaffale, libro)
*/
export const getAllScaffaliConLibri = async (req, res) => {
    // estrae solo il parametro di ricerca 'q'
    const { q = '' } = req.query;

    const mioId = req.userId;

    const is_q_popolato = q.trim().length > 0;
    
    

    const termine_ricercato = `%${q.toLowerCase()}%`;
    
    // costruisco la clausola WHERE in modo dinamico
    let condizioni = [];
    // escludo utente loggato
    condizioni.push(Prisma.sql`s.proprietario_id != ${mioId}`)

    if (is_q_popolato) {
        // Aggiunge i filtri testuali se 'q' è presente
        condizioni.push(Prisma.sql`
            LOWER(s.nome) LIKE ${termine_ricercato}
            OR LOWER(s.descrizione) LIKE ${termine_ricercato}
            OR LOWER(u.username) LIKE ${termine_ricercato}
            -- Controlla solo l'esistenza e passa true/false
            OR EXISTS (
            --SELECT 1 per dire al database di preoccuparsi solo dell'esistenza di una riga
                SELECT 1 FROM libri l2
                WHERE l2.scaffale_id = s.id
                AND LOWER(l2.titolo) LIKE ${termine_ricercato}
            )
        `)
    } 

    const whereCondizione = condizioni.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(condizioni, Prisma.sql` AND `)}`
    : Prisma.sql``; // Se non ci sono condizioni, la stringa WHERE è vuota

    try {
        const scaffali = await prisma.$queryRaw`
            SELECT
                s.id,
                s.nome,
                s.descrizione,
                COALESCE(ST_AsText(s.posizione), 'Nessuna Posizione') AS posizione,
                s.data_creazione,
                s.data_ultima_modifica,
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
            
            -- Inserisco la clausola WHERE costruita
            ${whereCondizione} 
            
            GROUP BY s.id, u.username, u.avatar, u.avatar_thumb
            
            -- Ordinamento per data di creazione, non per distanza
            ORDER BY s.data_creazione DESC
            
            LIMIT 20
        `;

        // costruisco la response
        const result = scaffali.map(s => ({
            id: s.id,
            nome: s.nome, 
            descrizione: s.descrizione || null,
            posizione: s.posizione,
            proprietario: {
                username: s.proprietario_username,
                avatar: s.proprietario_avatar
            },
            libri: s.libri.filter(book => book !== null)
        }));

        const messaggio = is_q_popolato ? `corrispondenti a "${q}"` : 'trovati nel database';

        res.status(200).json({
            message: `Scaffali ${messaggio}`,
            trovati : result.length,
            scaffali: result
        });

    } catch (err) {
        logger.error('Errore getAllScaffaliConLibri -> : Errore generico', err)
        console.error('Errore "getAllScaffaliConLibri":', err)
        res.status(500).json({ error: "Errore server - Impossibile completare la ricerca."}) 
    }
}
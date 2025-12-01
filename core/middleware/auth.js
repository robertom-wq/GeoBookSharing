/*
Questo middleware cerca un tocken JWT nel cookie o nell'header. Lo verifica con la chiave
segreta JWT_SECRET e se è valido salva userId, ruolo, isAdmin ed eventuali targetId nella req e prosegue. In caso contrario
blocca la richiesta
*/

import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    console.error("JWT_SECRET non definito. Imposta una chiave sicura in .env")
    process.exit(1)
}

const auth = async (req, res, next) => {
    let token
    // cerco nei cookies
    if (req.cookies?.jwt) {
        token = req.cookies.jwt
        console.log("Token da cookie: ", token)
    }
    

    // cerco nell'header Authorization
    const authHeader = req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim()
        console.log("Token da header: ", token)
    }
    
    // se non trovo il token resrtituisco 401 Unauthorized
    if (!token) {
        res.status(401).json( {error : "Accesso negato: JWT mancante"})
    }

    try {
        // provo a decodificare il token
        const decodificato = jwt.verify(token, JWT_SECRET)
        req.userId = decodificato.userId
        req.isAdmin = decodificato.ruolo === 'admin' // true se l'utente è admin

        // verifico che l'utente esista ancora o non sia bannato ( SELECT id, bannato FROM utenti WHERE id = decodificato.id)
        const utente = prisma.utenti.findUnique({
            where: {id: decodificato.id},
            select: {id:true, bannato: true}
        })

        // se utente non esiste oppure è bannato restituisce 400 Bad Request
        if (!utente || utente.bannato) {
            return res.status(400).json({ error: "Utente non valido o bannato"})
        }

        /*
         Gesrione dei parametri id nelle richieste (es in utenti/{id} etc.)
         */
        if (!req.params.id || req.params.id === '' || req.params.id === '{id}') {
            // pulizia, controlla se il parametro id è mancante (ad esempio, se l'utente ha chiamato
            // un URL come /utenti/ invece di /utenti/123) oppure se ha un valore falsy in JavaScript, come null o undefined.
            // se viene inviato una stringa vuota come id oppure il placeolder {id} 
            delete req.params.id
            // in quelle casistiche si intente come parametro l'id dell'utente loggato
            req.targetId = decodificato.userId
        } else {
            //parsifico il parametro come intero in base 10
            const targetId = parseInt(req.params.id, 10)
            if (isNaN(targetId)) {
                res.status(400).json({error: 'ID Non valido'})
            }
            req.targetId = targetId
            req.userId = decodificato.id
            req.ruolo = decodificato.ruolo || 'user' //'user' come fallback

            // passaggio al middleware successivo
            next()
        }
        


    } catch (err) {
        // caso 1, Token scaduto
        if (err.name = 'TokenExpiredError') {
            return res.status(401).json({error: "Token scaduto"})
        }
        // caso 2, Token non valido
        if (err.name = 'JsonWebTokenError') {
            return res.status(401).json({error: "Token non valido"})
        }
        console.error('Errore JWT', err);
        // Se non è nessuno dei due precendenti restituisco errore generico
        return res.status(401).json({error: "Errore di autenticazione JWT"})

    }
}


export default auth
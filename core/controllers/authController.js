/*
Controller che permette gestisce il sistema di autenticazione dell'utente.

note
Password criptata con bcryptjs con Work Factor 12. Essendo bcrypt legacy, possibile miglioria Argon2 raccomandato OSWAP 

L'Access Token è impostato per durare 7 giorni a scopo dimostrativo. In un ambiente di produzione, la durata dovrebbe essere 
ridotta a pochi minuti (e.g., 15m), implementando un meccanismo di Refresh Token per mantenere la sessione a lungo termine, 
per mitigare il rischio di furto del token (XSS).
*/

//import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcryptjs'
import jwt  from 'jsonwebtoken'
import { generateCsrfToken, CSRF_COOKIE_OPTIONS } from "../middleware/csrf.js"

import prisma from '../config/prisma.js'
import logger from '../config/logging.js'


//SETUP INIZIALE JWT E COOKIES
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRATION = '7d'



// Settagio parametri dei cookies
const COOKIE_OPTIONS = {
    httpOnly: true, // Blocca accesso da Javascript, previene furto xss
    secure: false, // false in ambiente di sviluppo in quanto non si dispone di https
    sameSite: 'lax',
    maxAge:  7*24*60*60 *1000// 7 giorni
}


//REGISTRAZIONE UTENTE
export const registrazione = async (req, res) => {
    const { email, cognome, nome, password, username} = req.body    
    try {
        // controllo se utente esiste nel db tramite username o email
        const esiste = await prisma.utenti.findFirst({
            where: {
                // o username o email già presenti
                OR : [
                    {email: email.toLowerCase()},
                    {username: username.toLowerCase()}
                ]
            }
        })
        if (esiste) {
            return res.status(400).json({
                error: esiste.email === email.toLowerCase() ? "Email già in uso" : "Username già in uso"
            })
        }

        //  cifratura della password tramite bcryptjs con wf 12
        const password_cifrata = await bcrypt.hash(password, 12)

        // creazione utente nel database tramite prisma
        const utente = await prisma.utenti.create({
            data: {
                nome,
                cognome,
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                hashed_password: password_cifrata,
            },
            // dati da inviare assieme alla response
            select: {
                id: true,
                username: true,
                ruolo: true,
                data_creazione: true,
            }

        })

        const csrf_token_value = generateCsrfToken(req, res) // creo token CSRF tramite 

        // creo un token firmato da inviare il browser
        const token = jwt.sign( {
            userId: utente.id,
            userUsername: utente.username,
            userRuolo: utente.ruolo,
            csrf_token: csrf_token_value
        }, JWT_SECRET, {expiresIn: JWT_EXPIRATION})
            
        
        // invio i due cookies
        res.cookie('jwt', token, COOKIE_OPTIONS) //JWT - il JS non lo vede
        res.cookie('csrf_token', csrf_token_value, CSRF_COOKIE_OPTIONS) //CSRF - leggibile dal JS del frontend

        logger.info("["+ req.ip +"] Tentativo di registrazione -> " + utente.username + ": Effettuato con successo")
        res.status(201).json({ 
            message: "Registrazione completata con successo",
            utente,
            csrf_token: csrf_token_value
        })

    } catch (err) {
        logger.error("["+ req.ip +"] Errore Registrazione -> : Errore generico", err)
        console.error("Errore di registrazione:", err)
        return res.status(500).json({error: "Errore server"})
    }


}

//LOGIN UTENTE
export const login = async (req, res) => {
    const { username, password } = req.body //destructuring, etraggo username e password dal body della richiesta
    try {
        const utente = await prisma.utenti.findUnique({
            where: { username: username.toLowerCase()},
        })
        // verifico se l'account è presente nel db e se l'utente non è stato bannato
        if (!utente || utente.bannato) {
            logger.error("["+ req.ip +"] Tentativo di accesso -> " + username + ": credenziali non valide, utente non esistente o bannato")
            return res.status(401).json({ error: "Credenziali non valide"})
        }

        // verifico se la password è corretta
        const password_valida = await bcrypt.compare(password, utente.hashed_password)
        if (!password_valida) {
            logger.error("["+ req.ip +"] Tentativo di accesso -> " + username + ": credenziali non valide, password errata")
            return res.status(401).json({error: "Credenziali non valide"})
        }
        
        // creo token CSRF tramite apposita funzione creata nel middleware csrf
        const csrf_token_value = generateCsrfToken(req, res)

        // creo un token jwt firmato da inviare il browser tramite cookie
        const token = jwt.sign( {
            userId: utente.id,
            userUsername: utente.username,
            userRuolo: utente.ruolo,
            csrf_token: csrf_token_value
        }, JWT_SECRET, {expiresIn: JWT_EXPIRATION})

        res.cookie('jwt', token, COOKIE_OPTIONS) //JWT - il JS non lo vede
        res.cookie('csrf_token', csrf_token_value, CSRF_COOKIE_OPTIONS) //CSRF - leggibile dal JS del frontend

        logger.info(" ["+ req.ip +"] Tentativo di accesso ->" + username + ": Effettuato con successo")
        // Risponsta positiva alla richiesta
        return res.status(200).json({
            message: "Login Effettuato",
            utente:
             {
                id: utente.id,
                username: utente.username,
                ruolo: utente.ruolo,
                avatar: utente.avatar,
                avatar_thumb: utente.avatar_thumb,
                biografia: utente.biografia,
                visualizzazioni: utente.visualizzazioni,
                email: utente.email
            }, 
            csrf_token: csrf_token_value // aggungo nel body anche il csrf_token
        })

    } catch (err) {
        logger.error("["+ req.ip +"] Errore Login -> : Errore generico", err)
        return res.status(500).json({error: "Errore server"})
    }
}

//LOGOUT
export const logout = (req, res) => {
    // invalida entrambi i cookies
    res.cookie('jwt', '', { ...COOKIE_OPTIONS, maxAge: 0})
    res.cookie('csrf_token', '', { ...COOKIE_OPTIONS, maxAge: 0})

    return res.json({message: 'Logout effettuato'})
}


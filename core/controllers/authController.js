/*
GESTISCE LA LOGICA DI BUSINNESS DI:
- LOGIN
- REGISTRAZIONE
- LOGOUT
FUNZIONALITA PRINCIPALI:

Password criptata con bcryptjs con Work Factor 12. Essendo bcrypt legacy, possibile miglioria Argon2 raccomandato OSWAP 
*/

import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const registrazione = async (req, res) => {
    const { email, cognome, nome, password, username} = req.body    
    try {
        // controllo se utente esiste nel db
        const esiste = await prisma.utenti.findFirst({
            where: {
                // o username o email già presenti
                OR : [
                    {email: email.toLowerCase()},
                    {username: username.toLowerCase()}
                ]
            }
        });
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
            // dati da inviare assieme alla res
            select: {
                id: true,
                username: true,
                data_creazione: true,
            }

        });

        res.status(201).json({ 
            mesage: "Registrazione completata con successo",
            utente
        })

    } catch (err) {
        console.error("Errore di registrazione:", err)
        res.status(500).json({error: "Errore server"})
    }


}

export const login = async (req, res) => {
    console.log(req)

    const { username, password } = req.body
    try {
        const utente = await prisma.utenti.findUnique({
            where: { username: username.toLowerCase()},
            select: {
                id: true,
                username: true,
                hashed_password: true,
                bannato: true,
                ruolo: true
            }
        });
        // verifico se l'account è presente nel db o se l'utente non è stato bannato
        if (!utente || utente.bannato) {
            return res.status(401).json({ error: "Credenziali non valide"})
        }

        // verifico se la password è corretta
        const password_valida = await bcrypt.compare(password, utente.hashed_password);
        if (!password_valida) {
            return res.status(401).json({error: "Credenziali non valide"})
        }

        // Risponsta positiva alla richiesta
        res.json({
            message: "Login Effettuato",
            utente: {
                id: utente.id,
                username: utente.username,
                ruolo: utente.ruolo
            }
        })

    } catch (err) {
        console.error("Errore Login:", err)
        res.status(500).json({error: "Errore server"})
    }
}


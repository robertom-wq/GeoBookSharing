//permette agli amministratori di visualizzare i log del sistema dal frontend tramite una chiamata API

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from "../config/logging.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getLogs = async (req, res) => {
    //Verifico il ruolo dell'autore della richiesta, se è user restituisco un 403 
    if (!req.isAdmin) {
        logger.warn(`[${req.ip}] Utente ${req.userId} ha tentato di accedere ai log amministrativi`)
        return res.status(403).json({ error: "Non sei autorizzato alla visualizzazione dei log" })
    }

    try {
        // Prende la data dalla query string (es. ?date=2025-12-18)
        // Se non viene fornita, usa la data di oggi come fallback
        const requestedDate = req.query.date || new Date().toISOString().split('T')[0]
        
        // Costruisco il percorso dinamico
        const logPath = path.join(__dirname, '../../logs', `app-${requestedDate}.log`)

        const data = await fs.readFile(logPath, 'utf8')
        
        const logs = data
            .split('\n') //trasformo il file in un array di stringhe, una per riga.
            .filter(line => line.trim()) //rimuovo eventuali righe vuote
            .map(line => { //converto ogni stringa i un oggetto json
                try {
                    return JSON.parse(line)
                } catch (e) {
                    return null // Salta righe corrotte
                }
            })
            .filter(log => log !== null) // Rimuovo eventuali parse falliti
            .reverse()

        return res.json(logs)
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Se il file per quella specifica data non esiste, restituisci array vuoto
            return res.status(200).json([])
        }
        return res.status(500).json({ message: "Errore nella lettura dei log" })
    }
}

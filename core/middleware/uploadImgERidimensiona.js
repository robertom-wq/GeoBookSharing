//Questo middleware gestisce il caricamento di un'immagine: 
//dalla ricezione dei dati alla validazione, fino alla creazione delle immagini main e thumbnail

import multer from 'multer'
import sharp from 'sharp'
import logger from '../config/logging.js'
import path from 'path'

const IMG_BASE_URL =  'uploads'
const AVATAR_PATH = `${IMG_BASE_URL}/avatars`
const COPERTINE_PATH = `${IMG_BASE_URL}/copertine`
const IMG_SIZE_LIMIT = 5*1024*1024 // limite a 5 Megabyte per i file caricati

// definizione dei parametri per multer
const upload  = multer({
    storage: multer.memoryStorage(), // durante upload immagine viene mantenuta in RAM
    limits: {fileSize: IMG_SIZE_LIMIT}, // Definisco il limite di grandezza del file
    fileFilter: (req, file, cb) => {
        // file.mimetype contiene il tipo MIME del file, testa per verificare se è formato consentito
        // Se il tipo MIME è consentito la callback cb è positiva e il file accettato, altrimenti Error 
        /jpeg|jpg|png|webp/.test(file.mimetype) ? cb(null, true) : cb(new Error('Puoi caricare solo immagini'))
    } 
})


// Ridimensionamento dell'immagine caricata
const ridimensiona = async (req, res, next) => {
    //console.log("UPLOAD")

    if (!req.file) {
        return next() // se il file non cè passa al prossimo middleware
    }
    const tipo = req.body.type // il tipo di immagine viene inviato durante aggiornamento Utente/Libro e può essere "avatar" o "copertina"
    const cartella = tipo === 'avatar' ? AVATAR_PATH: COPERTINE_PATH // 
    const estensione = path.extname(req.file.originalname) || '.jpg'
    // genero come base del nome file da caricare nella cartella basato su now (in modo da renderlo univoco)
    // assieme ad un numero casuale  in modo da evitare collissioni, seppur improbabili, di utenti
    // che dovessero caricare un file nello stesso preciso momento (es. 1765038069509-876543210.....jpg)
    const base_nome_file = `${Date.now()}-${Math.round(Math.random() * 1E9 )}`
    const buffer = req.file.buffer

    try {
        //immagine principale ridimensionata a 300x400
        const path_immagine_principale =  `${cartella}/${base_nome_file}-main${estensione}`
        //immagine anteprima, thumbnail a 128x192
        const path_immagine_anteprima =  `${cartella}/${base_nome_file}-thumb${estensione}`

        await Promise.all([
            sharp(buffer).resize(300, 400, {fit: 'cover', position: 'center'}).toFile(path_immagine_principale), 
            sharp(buffer).resize(128, 192, {fit: 'cover', position: 'center'}).toFile(path_immagine_anteprima)
        ])


        //passo gli url dei files al controller
        req.fileRidimensionato = {
            main: path_immagine_principale,
            thumb: path_immagine_anteprima
        }
        //console.log( req.fileRidimensionato)
        next()

    } catch (err) {
        logger.error('Errore ridimensionamento immagine -> : Errore generico')
        console.error('Errore "ridimensiona":', err)
        res.status(500).json({ error: "Errore server - Ridimensionamento immagine"})
    }
}

export default [upload.single('file'), ridimensiona]
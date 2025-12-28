//import { isISBN, clean, format } from 'isbn3';
import ISBN from './isbn-validate-bridge.cjs'
import axios from 'axios'
import path from 'path'
import sharp from 'sharp'
import logger from '../core/config/logging.js'

const CARTELLA_COPERTINE = path.join(process.cwd(), 'uploads', 'copertine')

/**
 Valida un codice ISBN (10 o 13) e lo restituisce formattato se è valido.
  */
export function checkISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '').toUpperCase(); // Pulizia manuale di base
    const length = cleanISBN.length;
    console.log(length, cleanISBN)

    // Controllo della lunghezza di base
    if (length !== 10 && length !== 13) {
        return { 
            valid: false, 
            fixed: null, 
            error: `Lunghezza ISBN non valida (${length}). Deve essere 10 o 13 cifre.` 
        };
    }

    // Validazione Ufficiale con ISBN.parse()
    const parsedIsbn = ISBN.parse(cleanISBN); 
    const valid = parsedIsbn !== null; 
    console.log(valid)

    if (valid) {
        // Se è valido, usiamo hyphenate() per formattarlo.
        const formattedISBN = ISBN.hyphenate(parsedIsbn.isbn13); // Formattiamo l'ISBN-13
        console.log(formattedISBN)
        return { 
            valid: true, 
            fixed: formattedISBN, 
            error: null 
        };
    } else {
        // Se non è valido
        return { 
            valid: false, 
            fixed: cleanISBN, 
            error: "ISBN non valido. La cifra di controllo non corrisponde alle regole di validazione." 
        };
    }
}

export const downloadERidimensionaCopertine = async (url_immagine) => {
    console.log("CARTELLA_COPERTINE", CARTELLA_COPERTINE)

    if (!url_immagine) {
        // Se l'URL non è fornito, restituisce subito il fallback.
        return {main: null, thumb: null}
    }

    try {
        const response = await axios.get(url_immagine, {
            responseType: 'arraybuffer',
            timeout: 10000 // 10 secondi
        })
        
        // Verifico che la risposta sia valida prima di procedere
        if (response.status !== 200) {
            throw new Error(`Download fallito con codice HTTP ${response.status}`);
        }
        const buffer = Buffer.from(response.data)
        const base = `${Date.now()}-${Math.floor(Math.random()*1E9)}`
        const estensione = path.extname(url_immagine.split('?')[0]) || '.jpg'
        //immagine main 300x400
        const main_namefile = path.join(CARTELLA_COPERTINE, `${base}-main${estensione}`)
        const main_promise= await sharp(buffer).resize(300, 400, { fit: 'cover', position: 'center'}).toFile(main_namefile)


        //immagine main 128x192
        const thumb_namefile = path.join(CARTELLA_COPERTINE, `${base}-thumb${estensione}`)
        const thumb_promise = await sharp(buffer).resize(128, 192, { fit: 'cover', position: 'center'}).toFile(thumb_namefile)

        // Esegue il resize e salvataggio in parallelo per velocità
        //await Promise.all([main_promise, thumb_promise])
        return {
            main: `uploads/copertine/${path.basename(main_namefile)}`,
            thumb: `uploads/copertine/${path.basename(thumb_namefile)}`
        }
    } catch (err) {
        logger.error('Errore downloadERidimensionaCopertine -> : Errore generico')
        console.error('Errore "downloadERidimensionaCopertine":', err.message)
        return { main: null, thumb: null } 
        }      
}
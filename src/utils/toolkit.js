// Funzione per tagliare testi troppo lunghi nelle descrizioni, da usare nelle anteprime
export function troncaStringa(str, n = 80) {
  //Se la stringa supera il limite 'n', la taglio e inserisco i tre puntini altrimenti la lascio intera
  return String(str).length > n ? str.slice(0, n) + "…" : str
}


// Funzione helper per estrarre lat/lng da formato WKT tipo POINT(lng lat)
//restituisce un oggetto da usare con Leaflet
export function parsePosizione(stringa_wkt) {
  //console.log('PARSE POSIZIONE')

        // Se la stringa è vuota o nulla, restituisco subito null per evitare errori
        if (!stringa_wkt) {
            return { lat: null, lng: null }
        }

        // Uso una regex. Esempio di stringa WKT "POINT(9.1900 45.4642)", cerca i due gruppi di numeri separati da uno spazio
        const parti_stringa = stringa_wkt.match(/POINT\(([^ ]+) ([^ ]+)\)/)

        //Se la regex ha trovato quello che cercava (3 elementi nell'array)
        if (parti_stringa && parti_stringa.length === 3) {
            // I database di solito usano ordine (Lng Lat), Leaflet usa (Lat Lng)
            // parti_stringa[1] = Longitudine; parti_stringa[2] = Latitudine
            // quindi le inverto mentre le converto in numeri decimali
            return {
                lat: parseFloat(parti_stringa[2]), // La latitudine è la seconda nel database
                lng: parseFloat(parti_stringa[1]) // La longitudine è la prima nel database
            }
        }
        // In caso di errori restituisco comunque dei valori nulli per sicurezza
        return { lat: null, lng: null }
    }
/* MIDDLEWARE GENERICO PER LA VALIDAZIONE DEGLI SCHEMI JOI
Scritto per evitare la ripetizione del codice sottostante 
*/

const valida_dati = (schema) => {
    return (req, res, next) => {

        let schemaDaValidare = schema
        //console.log("body",req.body)
        //se lo schema ha un contesto dinamico, es utilizzo di isAdmin
        //in updateUtente dove lo schema è definito come factory function
        //console.log(req.context, typeof schema === 'function')
        if (typeof schema === 'function') {
            //console.log(req.context)
            schemaDaValidare = schema(req.context || {})
        } else if (schema.context){
            schemaDaValidare = schema.context(req.context || {})
        }

        const { error, value } = schemaDaValidare.validate(req.body, {
            abortEarly: false, // Raccoglie tutti gli errori di validazione
            stripUnknown: true, // Rimuove i campi non definiti nello schema
            context: req.context || {}
     })
     if (error) {
        // Estrggo tutti i messaggi definiti nei Validators
        const details = error.details.map(d => d.message)
        //Prendo il primo messaggio come messaggio principale. Qualira ce ne fossero di piu, li visualizza nel FE uno alla volta
        //man mano che li risolvo
        return res.status(400).json({ 
                error: error.details[0].message, 
                details: details 
            })
     }
     //console.log("VALIDA DATI -> VALUE:", value)
     req.dati_validati = value
     next()
    }
}

export default valida_dati
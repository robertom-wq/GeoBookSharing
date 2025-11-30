/* MIDDLEWARE GENERICO PER LA VALIDAZIONE DEGLI SCHEMI JOI
Scritto per evitare la ripetizione del codice sottostante
*/

const valida_dati = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            context: req.context || {}
     });
     if (error) {
        const errors = error.details.map(d => d.message)
        return res.status(400).json({ errors: "Dati non Validi", details: errors });
     }
     req.dati_validati = value
     next()
    }
}

export default valida_dati
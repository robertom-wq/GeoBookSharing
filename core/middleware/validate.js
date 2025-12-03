/* MIDDLEWARE GENERICO PER LA VALIDAZIONE DEGLI SCHEMI JOI
Scritto per evitare la ripetizione del codice sottostante
*/

const valida_dati = (schema) => {
    return (req, res, next) => {

        let schemaDaValidare = schema
        //se lo schema ha un contesto dinamico, es utilizzo di isAdmin
        //in updateUtente dove lo schema è definito come factory function
        if (typeof schema === 'function') {
            schemaDaValidare = schema(req.context || {})
        } else if (schema.context){
            schemaDaValidare = schema.context(req.context || {})
        }
        ////////////////////////////////////////////////////////////////

        const { error, value } = schemaDaValidare.validate(req.body, {
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
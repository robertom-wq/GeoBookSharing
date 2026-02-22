import Joi from "joi";

//Permette di includere requisiti di validazione per i campi sensibili solo se l'utente che sta eseguendo l'aggiornamento ha ilpermesso necessario
export const updateUtenteSchema = (context = {}) => {
    const { isAdmin = false} = context

    return Joi.object({
        nome: Joi.string().min(3).max(50).trim().empty('').optional().messages({
            "string.min": "Il nome deve avere almeno 3 caratteri",
            "string.max": "Il nome può contenere al massimo 50 caratteri"
        }),
        cognome: Joi.string().min(3).max(50).trim().empty('').optional().messages({
            "string.min": "Il cognome deve avere almeno 3 caratteri",
            "string.max": "Il cognome può contenere al massimo 50 caratteri",
        }),
        username: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(3).max(30).trim().empty('').optional().messages({
            "string.pattern.base": "Il username può contenere solo lettere, numeri, punto, trattino e underscore.",
            "string.min": "Username deve avere almeno 3 caratteri",
            "string.max": "Username può contenere al massimo 30 caratteri",
        }),
        password: Joi.string().min(6).optional().messages({
                "string.min" : "La password deve avere almeno 6 caratteri",
        }),
        email: Joi.string().email({tlds: {allow:false}}).optional().messages({
            "string.email" : "Email non valida",
        }),
        biografia: Joi.string().empty('').optional(),

        // tipo di file : AVATAR
        type: Joi.string().valid('avatar').optional(),

        // riservato agli admin (cerca la variabile di contesto isAdmin)
        ruolo: Joi.string().valid('user', 'admin').when(Joi.ref(`$isAdmin`), {
            is: true,
            // se utente è admin allora è compilabile altrimenti Forbidden
            then: Joi.optional(),
            otherwise: Joi.forbidden() 
        }),
        bannato: Joi.boolean().when(Joi.ref(`$isAdmin`), {
            is: true,
            // se utente è admin allora è compilabile altrimenti Forbidden
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        })

    })
    .min(1) // almeno un campo da modificre
}


//Per soft delete utente
export const richiestaEliminazioneSchema = Joi.object({
    richiesta_eliminazione: Joi.boolean().required().messages({
       "boolean.base": "Il campo 'richiesta_eliminazione' deve essere un valore booleano (true o false)."
    }),
    data_richiesta_eliminazione: Joi.date().iso().allow(null).messages({
        "date.base": "Il campo 'data_richiesta_eliminazione' deve essere una data valida.",
        "date.format": "La data deve essere nel formato ISO 8601 (es. .toISOString())."
    })
})
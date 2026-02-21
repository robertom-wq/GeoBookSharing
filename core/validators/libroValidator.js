import Joi from "joi"

export const createLibroSchema = Joi.object({
    titolo: Joi.string().min(3).max(255).trim().required().messages({
        'string.base': 'Il titolo deve essere una stringa di testo.',
        'string.empty': 'Il titolo non può essere vuoto.',
        'string.min': 'Il titolo deve contenere almeno 3 caratteri.',
        'string.max': 'Il titolo non può superare i 255 caratteri.',
        'any.required': 'Il titolo è obbligatorio.'
    }),
    autore: Joi.string().min(3).max(255).trim().empty('').messages({
        'string.base': 'L\'autore deve essere una stringa di testo.',
        'string.min': 'L\'autore deve contenere almeno 3 caratteri.',
        'string.max': 'L\'autore non può superare i 255 caratteri.',
    }),
    isbn: Joi.string().max(20).min(10).trim().empty('').messages({
        'string.base': 'Il codice isbn deve essere una stringa di testo.',
        'string.min': 'Il codice isbn deve contenere almeno 10 caratteri.',
        'string.max': 'Il codice isbn non può superare i 20 caratteri.',
    }),
    anno: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional().messages({
        'number.base': 'L\'anno deve essere un numero intero.',
        'number.integer': 'L\'anno deve essere un numero intero.',
        'number.min': 'L\'anno minimo valido è 1000.',
        'number.max': `L\'anno non può superare l'anno corrente.`
    }),
    descrizione: Joi.string().max(1000).trim().allow('').optional().messages({
        'string.base': 'La descrizione deve essere una stringa di testo.',
        'string.max': 'La descrizione non può superare i 1000 caratteri.'
    }),
    scaffale_id: Joi.number().integer().min(1).required().messages({
        'number.base': 'L\'ID dello scaffale deve essere un numero intero.',
        'number.integer': 'L\'ID dello scaffale deve essere un numero intero.',
        'number.min': 'L\'ID dello scaffale deve essere maggiore o uguale a 1.',
        'any.required': 'L\'ID dello scaffale è obbligatorio.'
    }),
    genere_id: Joi.number().integer().min(1).allow(null).messages({
        'number.base': 'L\'ID del genere deve essere un numero intero.',
        'number.integer': 'L\'ID del genere deve essere un numero intero.',
        'number.min': 'L\'ID del genere deve essere maggiore o uguale a 1.',
    }),
    tipo_condivisione_id: Joi.number().integer().min(1).allow(null).messages({
        'number.base': 'L\'ID del tipo di condivisione deve essere un numero intero.',
        'number.integer': 'L\'ID del tipo di condivisione deve essere un numero intero.',
        'number.min': 'L\'ID del tipo di condivisione deve essere maggiore o uguale a 1.',
    })
}).options({
    convert: true
})


export const updateLibroSchema = Joi.object({
    //.empty('') Se Joi incontra '' o ' ', lo scarta e procede con la validazione come se il campo non fosse stato fornito
    titolo: Joi.string().min(3).max(255).trim().empty('').optional().messages({
        'string.base': 'Il titolo deve essere una stringa di testo.',
        'string.min': 'Il titolo deve contenere almeno 3 caratteri.',
        'string.max': 'Il titolo non può superare i 255 caratteri.',
    }),
    autore: Joi.string().empty('').max(255).trim().optional().messages({
        'string.base': 'L\'autore deve essere una stringa di testo.',
    }),
    isbn: Joi.string().max(20).min(10).trim().empty('').optional().messages({
        'string.base': 'Il codice isbn deve essere una stringa di testo.',
        'string.min': 'Il codice isbn deve contenere almeno 10 caratteri.',
        'string.max': 'Il codice isbn non può superare i 20 caratteri.',
    }),
    anno: Joi.number().integer().min(1000).max(new Date().getFullYear() + 1).optional().messages({
        'number.base': 'L\'anno deve essere un numero intero.',
        'number.integer': 'L\'anno deve essere un numero intero.',
        'number.min': 'L\'anno minimo valido è 1000.',
        'number.max': `L\'anno non può superare l'anno corrente più uno.`
    }),
    descrizione: Joi.string().max(1000).empty('').optional().messages({
        'string.base': 'La descrizione deve essere una stringa di testo.',
        'string.max': 'La descrizione non può superare i 1000 caratteri.',
    }),
    scaffale_id: Joi.number().integer().min(1).allow(null).optional().messages({
        'number.base': 'L\'ID dello scaffale deve essere un numero intero.',
        'number.integer': 'L\'ID dello scaffale deve essere un numero intero.',
        'number.min': 'L\'ID dello scaffale deve essere maggiore o uguale a 1.'
    }),
    genere_id: Joi.number().integer().min(1).allow(null).optional().messages({
        'number.base': 'L\'ID del genere deve essere un numero intero.',
        'number.integer': 'L\'ID del genere deve essere un numero intero.',
        'number.min': 'L\'ID del genere deve essere maggiore o uguale a 1.'
    }),
    tipo_condivisione_id: Joi.number().integer().min(1).allow(null).optional().messages({
        'number.base': 'L\'ID del tipo di condivisione deve essere un numero intero.',
        'number.integer': 'L\'ID del tipo di condivisione deve essere un numero intero.',
        'number.min': 'L\'ID del tipo di condivisione deve essere maggiore o uguale a 1.'
    }),
    // forza il cast di true/false da eventuale testo a boolen
    is_disponibile: Joi.boolean().truthy('true').falsy('false').empty('').optional().messages({
        'boolean.base': 'La disponibilità deve essere un valore booleano (true o false).'
    })
}).options({
    convert: true
}).min(1).messages({
    'object.min': 'La richiesta di aggiornamento deve contenere almeno un campo da modificare.'
});

export const createLibroFromMasterSchema = Joi.object({
    master_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID del libro Master deve essere un numero intero.',
        'number.integer': 'L\'ID del libro Master deve essere un numero intero.',
        'any.required': 'L\'ID del libro Master è obbligatorio.'
    }),
    scaffale_id: Joi.number().integer().required().messages({
        'number.base': 'L\'ID dello scaffale deve essere un numero intero.',
        'number.integer': 'L\'ID dello scaffale deve essere un numero intero.',
        'any.required': 'L\'ID dello scaffale è obbligatorio.'
    })
})
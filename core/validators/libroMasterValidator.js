import Joi from 'joi';

export const createLibroMasterSchema = Joi.object({
    titolo: Joi.string().max(300).trim().required().messages({
            'any.required': 'Il campo titolo è obbligatorio per la creazione.',
            'string.empty': 'Il titolo non può essere vuoto.',
            'string.max': 'Il titolo non può superare i 300 caratteri.'
        }),

    isbn: Joi.string().min(10).max(20).required().trim().messages({
            'any.required': 'Il codice ISBN è obbligatorio per la creazione.',
            'string.empty': 'Il codice ISBN non può essere vuoto.',
            'string.max': 'Il codice ISBN non può superare i 20 caratteri.'
        }),

    autore: Joi.string().max(1000).trim().required().messages({
            'string.max': 'Il campo autore non può superare i 1000 caratteri.'
        }),

    anno: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional().allow(null).messages({
            'number.base': 'L\'anno deve essere un numero intero.',
            'number.max': 'L\'anno non può essere nel futuro.'
        }),

    descrizione: Joi.string().max(2000).optional().allow(null, '').messages({ 
        'string.max': 'La descrizione non può superare i 2000 caratteri.' }),

    genere_id: Joi.number().integer().min(1).optional().allow(null).messages({
         'number.base': 'L\'ID del genere deve essere un numero intero.' }),

    // tipo di file : COPERTINA
    type: Joi.string().valid('copertina').optional()
}).options({
    stripUnknown: true,
    convert: true
})

export const updateLibroMasterSchema = Joi.object({
    titolo: Joi.string().max(300).trim().empty('').optional().messages({
            'string.empty': 'Il titolo non può essere vuoto.',
            'string.max': 'Il titolo non può superare i 300 caratteri.'
        }),

    isbn: Joi.string().max(20).min(10).trim().allow(null, '').optional().messages({
            'string.empty': 'Il codice ISBN non può essere vuoto.',
            'string.max': 'Il codice ISBN non può superare i 20 caratteri.'
        }),

    autore: Joi.string().max(1000).trim().optional().allow(null, '').messages({
            'string.max': 'Il campo autore non può superare i 1000 caratteri.'
        }),

    anno: Joi.number().integer().min(1000).max(new Date().getFullYear() + 1).optional().messages({
        'number.base': 'L\'anno deve essere un numero intero.',
        'number.integer': 'L\'anno deve essere un numero intero.',
        'number.min': 'L\'anno minimo valido è 1000.',
        'number.max': `L\'anno non può superare l'anno corrente più uno.`
    }),

    descrizione: Joi.string().max(2000).optional().allow(null, '').trim().empty().messages({ 
        'string.max': 'La descrizione non può superare i 2000 caratteri.' }),


    genere_id: Joi.number().integer().min(1).optional().allow(null).messages({ 
            'number.base': 'L\'ID del genere deve essere un numero intero.' }),

        // tipo di file : COPERTINA
    type: Joi.string().valid('copertina').optional(),
}).options({
    stripUnknown: true,
    convert: true
}).min(1)
.messages({
    'object.min': 'La richiesta di aggiornamento deve contenere almeno un campo da modificare.'
});

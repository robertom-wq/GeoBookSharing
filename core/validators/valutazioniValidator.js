import Joi from 'joi'

export const createValutazioneSchema = Joi.object({
    condivisione_id: Joi.number().integer().positive().required().messages({
        'any.required' : "L'ID della condivisione è necessario per esprimere la valutazione",
        'number.base': 'ID condivisione non valido'
    }),
/*     recensito_id: Joi.number().integer().positive().required().messages({
        'any.required' : "L'ID recensito_id è necessario per esprimere la valutazione",
        'number.base': 'ID recensito_id non valido'
    }), */
/*     recensore_id: Joi.number().integer().positive().required().messages({
        'any.required' : "L'ID recensore_id è necessario per esprimere la valutazione",
        'number.base': 'ID recensore_id non valido'
    }), */
    voto: Joi.number().integer().min(1).max(5).required().messages({
        'any.required' : "Il voto è necessario per esprimere la valutazione",
        'number.base': 'Valore voto non valido',
        'number.max' : 'Il voto non può essere superiore a 5',
        'number.min' : 'Il voto non può essere inferiore a 1'
    }),
    recensione: Joi.string().allow('').max(1000).optional().messages({
        'string.max' : 'Il commento non può superare i 1000 caratteri'
    })
}).options({
    stripUnknown: true,
    convert: true
})
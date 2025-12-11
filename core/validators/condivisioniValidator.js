import Joi from 'joi'

export const createCondivisioniSchema = Joi.object({
    libro_id: Joi.number().integer().positive().required().messages({
        'any.required' : 'Il campo libro_id è obbligatorio',
        'number.base' : 'Libro id deve essere un numero'
    }),
    tipo_condivisione_id:  Joi.number().integer().positive().required().messages({
        'any.required' : 'Il campo tipo_condivisione_id è obbligatorio',
        'number.base' : 'Libro id deve essere un numero'
    }),
    data_dal: Joi.date().iso().optional().messages({
        'data.format' : 'Formato data non valido YYYY-MM-DD'
    }),
    data_al: Joi.date().iso().optional().messages({
        'data.format' : 'Formato data non valido YYYY-MM-DD'
    }),
    note: Joi.string().max(500).allow('').optional().messages({
        "string.max" : "Il campo note non può essere superiore ai 500 caratteri"
    })
}).custom((value, helpers) => {
    // Se esiste il campo data_al e data_dal, verifico che data_dal NON sia maggiore di data_al
    if(value.data_dal && value.data_al && new Date(value.data_dal) > new Date(value.data_al)) {
        return helpers.message('La data di inizio deve essere antecedente o uguale alla data di fine')
    }
    return value
}).options({stripUnknown: true, convert:true})

export const updateStatoCondivisioniSchema = Joi.object({
    azione: Joi.string().valid('accetta','rifiuta').required().messages({
        'any.only' : "Azione non valida, usa Accetta o Rifiuta"
    }),
    note: Joi.string().max(500).allow('').optional().when('azione', { is: 'rifiuta', then: Joi.string().min(10).required().messages({
            'any.required' : 'Inserisci una motivazione per il rifiuto'
        })
    })
}).min(1).options({stripUnknown : true})

export const deleteCondivisioneSchema = Joi.object({
    motivo: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La motivazione non può superare i 500 caratteri'
    })
}).options({stripUnknown: true})
import Joi from "joi";

export const createScaffaleSchema = Joi.object({
    nome: Joi.string().min(3).max(100).required().messages({
            'string.empty': 'Il nome è obbligatorio.',
            'string.min': 'Il nome deve contenere almeno 3 caratteri.',
            'string.max': 'Il nome non può superare i 100 caratteri.',
            'any.required': 'Il campo nome è obbligatorio.'}),
    descrizione: Joi.string().max(500).allow('').optional().messages({
            'string.max': 'La descrizione non può superare i 500 caratteri.'}),
    lat: Joi.number().min(-90).max(90).required().messages({
            'any.required': 'La latitudine è obbligatoria.',
            'number.base': 'La latitudine deve essere un numero valido.',
            'number.min': 'La latitudine deve essere compresa tra -90 e 90.',
            'number.max': 'La latitudine deve essere compresa tra -90 e 90.'}),
    lng: Joi.number().min(-180).max(180).required().messages({
            'any.required': 'La longitudine è obbligatoria.',
            'number.base': 'La longitudine deve essere un numero valido.',
            'number.min': 'La longitudine deve essere compresa tra -180 e 180.',
            'number.max': 'La longitudine deve essere compresa tra -180 e 180.'}),
})

export const updateScaffaleSchema = Joi.object({
    nome: Joi.string().min(3).max(100).allow('').optional().messages({
            'string.empty': 'Il nome è obbligatorio.',
            'string.min': 'Il nome deve contenere almeno 3 caratteri.',
            'string.max': 'Il nome non può superare i 100 caratteri.',
            'any.required': 'Il campo nome è obbligatorio.'}),
    descrizione: Joi.string().max(500).allow('').optional().messages({
            'string.max': 'La descrizione non può superare i 500 caratteri.'}),
    lat: Joi.number().min(-90).max(90).optional().messages({
            'any.required': 'La latitudine è obbligatoria.',
            'number.base': 'La latitudine deve essere un numero valido.',
            'number.min': 'La latitudine deve essere compresa tra -90 e 90.',
            'number.max': 'La latitudine deve essere compresa tra -90 e 90.'}),
    lng: Joi.number().min(-180).max(180).optional().messages({
            'any.required': 'La longitudine è obbligatoria.',
            'number.base': 'La longitudine deve essere un numero valido.',
            'number.min': 'La longitudine deve essere compresa tra -180 e 180.',
            'number.max': 'La longitudine deve essere compresa tra -180 e 180.'}),
}).min(1).with('lat', 'lng')
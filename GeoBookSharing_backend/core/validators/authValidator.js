/*SCHEMA PER LA VALIDAZIONE DEI DATI DELLA REGISTRAZIONE E DEL LOGIN */

import Joi from "joi"

export const schema_registrazione = Joi.object({
    nome: Joi.string().min(3).max(50).required().messages({
        "string.min": "Il nome deve avere almeno 2 caratteri",
        "string.max": "Il nome può contenere al massimo 50 caratteri",
        "any.required" : "Il nome è obbligatorio"
    }),
    cognome: Joi.string().min(2).max(50).required().messages({
        "string.min": "Il cognome deve avere almeno 2 caratteri",
        "string.max": "Il cognome può contenere al massimo 50 caratteri",
        "any.required" : "Il cognome è obbligatorio"
    }),
    username: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(3).max(30).required().messages({
        "string.pattern.base": "Il username può contenere solo lettere, numeri, punto, trattino e underscore.",
        "string.min": "Username deve avere almeno 3 caratteri",
        "string.max": "Username può contenere al massimo 30 caratteri",
        "any.required" : "Username è obbligatorio",
        "string.empty": "Il campo username non può essere vuoto.",
    }),
    email: Joi.string().email({tlds: {allow:false}}).required().messages({
        "string.email" : "Email non valida",
        "any.required" : "Email Obbligatoria"
    }),
    password: Joi.string().min(6).required().messages({
        "string.min" : "La password deve avere almeno 6 caratteri",
        "any.required" : "La password è obbligatoria",
        "string.empty": "Il campo password non può essere vuoto.",
    }),
    privacy_policy_accettata: Joi.boolean().valid(true).required().messages({
        "any.only": "Devi accettare la privacy policy per continuare",
        "any.required": "L'accettazione della privacy policy è obbligatoria",
        "boolean.base": "Il campo privacy policy deve essere un valore booleano"
    })
}).options({ stripUnknown: true}) // rimuove i campi extra non definiti

export const schema_login = Joi.object({
    username: Joi.string().pattern(/^[a-zA-Z0-9._-]+$/).min(3).max(30).required().messages({
        "string.pattern.base": "Il username può contenere solo lettere, numeri, punto, trattino e underscore.",
        "string.min": "Username deve avere almeno 3 caratteri",
        "string.max": "Username può contenere al massimo 30 caratteri",
        "any.required" : "Username è obbligatorio",
        "string.empty": "Il campo username non può essere vuoto.",
    }),
    password: Joi.string().min(6).required().messages({
        "any.required" : "La password è obbligatoria",
        "string.empty": "Il campo password non può essere vuoto.",
    })
})
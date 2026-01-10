import express from "express";
import { creaValutazione, getAllValutazioni, getVotazioneMediaUtente } from "../controllers/valutazioniController.js";
import { createValutazioneSchema } from "../validators/valutazioniValidator.js";
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";
import valida_dati from "../middleware/validate.js";

const valutazioniRouter = express.Router()


valutazioniRouter.post('/nuova', auth, csrf_protection, valida_dati(createValutazioneSchema), creaValutazione)

valutazioniRouter.get('/valutazioniRecenti/:id', auth, getVotazioneMediaUtente)

valutazioniRouter.get('/mieValutazioni', auth, getAllValutazioni)




export default valutazioniRouter
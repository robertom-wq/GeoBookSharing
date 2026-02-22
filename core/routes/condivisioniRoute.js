import express from "express"
import { createCondivisioniSchema, updateStatoCondivisioniSchema, deleteCondivisioneSchema } from "../validators/condivisioniValidator.js"
import valida_dati from "../middleware/validate.js"
import auth from "../middleware/auth.js"
import { csrf_protection } from "../middleware/csrf.js"
import { aggiornaStatoCondivisione, concludiPrestito, creaRichiestaCondivisione, getMieCondivisioni, deleteCondivisione } from "../controllers/condivisioniController.js"

const condivisioniRouter = express.Router()

condivisioniRouter.post('/', auth, csrf_protection, valida_dati(createCondivisioniSchema), creaRichiestaCondivisione)

condivisioniRouter.get('/', auth, getMieCondivisioni)

condivisioniRouter.patch('/:id/stato', auth, csrf_protection, valida_dati(updateStatoCondivisioniSchema), aggiornaStatoCondivisione)

condivisioniRouter.patch('/:id/concludi', auth, csrf_protection, concludiPrestito)

condivisioniRouter.delete('/:id', auth, csrf_protection, valida_dati(deleteCondivisioneSchema), deleteCondivisione)






export default condivisioniRouter
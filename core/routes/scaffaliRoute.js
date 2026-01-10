import express from "express";
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";
import valida_dati from "../middleware/validate.js";
import { createScaffale, getScaffaleById, deleteScaffale, getMieiScaffali, updateScaffale, getScaffaliVicini, getAllScaffaliConLibri } from "../controllers/scaffaliController.js";
import { createScaffaleSchema, updateScaffaleSchema } from "../validators/scaffaliValidator.js"

const scaffaliRouter = express.Router()


scaffaliRouter.post('/nuovo', auth, csrf_protection, valida_dati(createScaffaleSchema), createScaffale)

scaffaliRouter.patch('/:id', auth, csrf_protection, valida_dati(updateScaffaleSchema), updateScaffale)

scaffaliRouter.get('/mieiScaffali', auth, getMieiScaffali)

scaffaliRouter.get('/:id', auth, getScaffaleById)

scaffaliRouter.delete('/mieiScaffali/:id', auth, csrf_protection, deleteScaffale)

scaffaliRouter.get('/ricercaScaffaliConLibri', auth, getAllScaffaliConLibri)

scaffaliRouter.get('/ricercaScaffaliVicini', auth, getScaffaliVicini)

export default scaffaliRouter
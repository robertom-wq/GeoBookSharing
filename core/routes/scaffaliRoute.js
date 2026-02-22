import express from "express"
import auth from "../middleware/auth.js"
import { csrf_protection } from "../middleware/csrf.js"
import valida_dati from "../middleware/validate.js"
import { createScaffale, getScaffaleById, deleteScaffale, getMieiScaffali, updateScaffale } from "../controllers/scaffaliController.js"
import { createScaffaleSchema, updateScaffaleSchema } from "../validators/scaffaliValidator.js"

const scaffaliRouter = express.Router()


scaffaliRouter.post('/', auth, csrf_protection, valida_dati(createScaffaleSchema), createScaffale)

scaffaliRouter.get('/mieiScaffali', auth, getMieiScaffali)

scaffaliRouter.patch('/:id', auth, csrf_protection, valida_dati(updateScaffaleSchema), updateScaffale)

scaffaliRouter.get('/:id', auth, getScaffaleById)

scaffaliRouter.delete('/:id', auth, csrf_protection, deleteScaffale)



export default scaffaliRouter
import express from "express"
import { getAllUtenti, getProfilo, updateUtente, softDeleteUtente, deleteUtente } from "../controllers/utentiController.js"
import auth from "../middleware/auth.js"
import { csrf_protection } from "../middleware/csrf.js"
import valida_dati from "../middleware/validate.js"
import { richiestaEliminazioneSchema, updateUtenteSchema } from "../validators/utenteValidator.js"
import uploadImgERidimensiona from "../middleware/uploadImgERidimensiona.js"

const utentiRouter = express.Router()


utentiRouter.get("/", auth, getAllUtenti)

utentiRouter.delete("/me", auth, csrf_protection, valida_dati(richiestaEliminazioneSchema), softDeleteUtente)

utentiRouter.patch("/me", auth, csrf_protection, uploadImgERidimensiona, valida_dati(updateUtenteSchema), updateUtente)

utentiRouter.get("/me", auth, getProfilo)

utentiRouter.get("/:id", auth, getProfilo)

utentiRouter.patch("/:id", auth, csrf_protection, uploadImgERidimensiona, valida_dati(updateUtenteSchema), updateUtente)

utentiRouter.delete("/:id", auth, csrf_protection, deleteUtente)






export default utentiRouter
import express from "express";
import { getAllUtenti, getProfilo, updateUtente, softDeleteUtente, deleteUtente } from "../controllers/utentiController.js";
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";
import valida_dati from "../middleware/validate.js";
import { richiestaEliminazioneSchema, updateUtenteSchema } from "../validators/utenteValidator.js";
import uploadImgERidimensiona from "../middleware/uploadImgERidimensiona.js";

const utentiRouter = express.Router()


utentiRouter.get("/all", auth, getAllUtenti)

utentiRouter.patch("/richiestaCancellazione", auth, csrf_protection, valida_dati(richiestaEliminazioneSchema), softDeleteUtente)

utentiRouter.get("/profilo{/:id}", auth, getProfilo)

utentiRouter.patch("/profilo{/:id}", auth, csrf_protection, uploadImgERidimensiona, valida_dati(updateUtenteSchema), updateUtente)

utentiRouter.delete("/profilo{/:id}", auth, csrf_protection, deleteUtente)






export default utentiRouter
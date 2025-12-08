import express from "express"
import auth from "../middleware/auth.js"
import { csrf_protection } from "../middleware/csrf.js"
import { addLibroMasterFromISBN, createLibroMaster, deleteLibroMaster, getAllLibriMaster, getLibroMasterById, updateLibroMaster } from "../controllers/libriMasterController.js"
import valida_dati from "../middleware/validate.js"
import { createLibroMasterSchema, updateLibroMasterSchema } from "../validators/libroMasterValidator.js"
import uploadImgERidimensiona from "../middleware/uploadImgERidimensiona.js"

const libriMasterRouter = express.Router()

libriMasterRouter.post('/nuovoFromISBN', auth, csrf_protection, addLibroMasterFromISBN)

libriMasterRouter.post('/nuovo', auth, csrf_protection, uploadImgERidimensiona, valida_dati(createLibroMasterSchema), createLibroMaster)

libriMasterRouter.get('/all', auth, getAllLibriMaster)

libriMasterRouter.get('/libro/:id', auth, getLibroMasterById)

libriMasterRouter.delete('/libro/:id', auth, csrf_protection, deleteLibroMaster)

libriMasterRouter.patch('/libro/:id', auth, csrf_protection, uploadImgERidimensiona,valida_dati(updateLibroMasterSchema), updateLibroMaster)

export default libriMasterRouter
import express from "express";
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";
import valida_dati from "../middleware/validate.js";
import uploadImgERidimensiona from "../middleware/uploadImgERidimensiona.js";
import { createLibro, createLibroFromMaster, deleteLibro,
     getAllGeneriLetterari, getAllLibri, getAllTipiCondivisione,
      getLibriPiuVisitati,getLibriVicini, getLibroById, getMieiLibri, updateLibro } from "../controllers/libriController.js";
import { createLibroSchema, updateLibroSchema, createLibroFromMasterSchema } from "../validators/libroValidator.js";

const libriRouter = express.Router()


libriRouter.post('/', auth, csrf_protection, uploadImgERidimensiona, valida_dati(createLibroSchema), createLibro)

libriRouter.post('/daMaster', auth, csrf_protection, uploadImgERidimensiona, valida_dati(createLibroFromMasterSchema), createLibroFromMaster)

libriRouter.get('/', auth, getAllLibri)

libriRouter.get('/mieiLibri', auth, getMieiLibri)

libriRouter.get('/generi', auth, getAllGeneriLetterari)

libriRouter.get('/topVisitati', auth, getLibriPiuVisitati)

libriRouter.get('/libriVicini', auth, getLibriVicini)

libriRouter.get('/tipiCondivisione', auth, getAllTipiCondivisione)

libriRouter.get('/:id', auth, getLibroById)

libriRouter.delete('/:id', auth, csrf_protection, deleteLibro)

libriRouter.patch('/:id', auth, csrf_protection, uploadImgERidimensiona,valida_dati(updateLibroSchema), updateLibro)


export default libriRouter
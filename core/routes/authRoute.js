import express from "express";
import { testGet,registrazione, login } from "../controllers/authController.js";
import valida_dati from "../middleware/validate.js";
import { schema_login, schema_registrazione } from "../validators/authValidator.js";

const authRouter = express.Router();


authRouter.post('/registrazione', valida_dati(schema_registrazione), registrazione);


authRouter.get('/login', valida_dati(schema_login), login)



export default authRouter
import express from "express";
import { registrazione, login, logout } from "../controllers/authController.js";
import valida_dati from "../middleware/validate.js";
import { schema_login, schema_registrazione } from "../validators/authValidator.js";
import auth from "../middleware/auth.js"

const authRouter = express.Router();


authRouter.post('/registrazione', valida_dati(schema_registrazione), registrazione)
authRouter.post('/login', valida_dati(schema_login), login)
authRouter.post('/logout',auth, logout)





export default authRouter
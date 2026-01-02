import { Router } from 'express';
import { getLogs } from '../controllers/adminController.js';
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";

const routerAdmin = Router();

// Proteggi questa rotta con i tuoi middleware di sicurezza!
routerAdmin.get('/system-logs', auth, csrf_protection, getLogs);

export default routerAdmin;
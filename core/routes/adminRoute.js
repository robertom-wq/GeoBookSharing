import { Router } from 'express';
import { getLogs } from '../controllers/adminController.js';
import auth from "../middleware/auth.js";
import { csrf_protection } from "../middleware/csrf.js";

const routerAdmin = Router();

routerAdmin.get('/system-logs', auth, getLogs);

export default routerAdmin;
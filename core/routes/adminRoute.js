import express from "express"
import { getLogs } from '../controllers/adminController.js'
import auth from "../middleware/auth.js"

const routerAdmin = express.Router()

routerAdmin.get('/system-logs', auth, getLogs)

export default routerAdmin
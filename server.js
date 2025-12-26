import express from 'express'
import cors from 'cors'
import authRouter from './core/routes/authRoute.js'
import cookieParser from 'cookie-parser'
import logger from './core/config/logging.js'
import utentiRouter from './core/routes/utentiRoute.js'
import scaffaliRouter from './core/routes/scaffaliRoute.js'
import libriRouter from './core/routes/libriRoute.js'
import libriMasterRouter from './core/routes/libriMasterRoute.js'
import condivisioniRouter from './core/routes/condivisioniRoute.js'
import valutazioniRouter from './core/routes/valutazioniRoute.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

// Serve per leggere il body delle richieste in formato json
app.use(express.json())

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:3000'
    ].filter(Boolean),
    credentials: true,
    methods: ['GET','POST','PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization','x-csrf-token']
}))

app.use(cookieParser())

app.use('/api/auth', authRouter)

app.use('/api/utenti', utentiRouter)

app.use('/api/scaffali', scaffaliRouter)

app.use('/api/libri', libriRouter)

app.use('/api/libriMaster', libriMasterRouter)

app.use('/api/condivisioni', condivisioniRouter)

app.use('/api/valutazioni', valutazioniRouter)

app.use('/uploads', (req, res, next)=>{
    res.setHeader('Cross-Origin-Resource-Policy','cross-origin')
    next()    
}, express.static(path.join(__dirname, '/uploads')))

app.listen(3000, 'localhost', () => {
    logger.info("Server Backend avviato - API su http://localhost:3000")
    console.log("API su http://localhost:3000")
})
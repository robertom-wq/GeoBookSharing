import express from 'express'
import authRouter from './core/routes/authRoute.js'
import cookieParser from 'cookie-parser'
import logger from './core/config/logging.js'
import utentiRouter from './core/routes/utentiRoute.js'
import scaffaliRouter from './core/routes/scaffaliRoute.js'
import libriRouter from './core/routes/libriRoute.js'
import libriMasterRouter from './core/routes/libriMasterRoute.js'
import condivisioniRouter from './core/routes/condivisioniRoute.js'
import valutazioniRouter from './core/routes/valutazioniRoute.js'

const app = express()

// Serve per leggere il body delle richieste in formato json
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)

app.use('/api/utenti', utentiRouter)

app.use('/api/scaffali', scaffaliRouter)

app.use('/api/libri', libriRouter)

app.use('/api/libriMaster', libriMasterRouter)

app.use('/api/condivisioni', condivisioniRouter)

app.use('/api/valutazioni', valutazioniRouter)

app.listen(3000, 'localhost', () => {
    logger.info("Server Backend avviato - API su http://localhost:3000")
    console.log("API su http://localhost:3000")
})
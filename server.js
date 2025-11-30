import express from 'express';
import authRouter from './core/routes/authRoute.js';

const app = express();

// Serve per leggere il body delle richieste in formato json
app.use(express.json());

app.use('/api/auth', authRouter)

app.listen(3000,'localhost', () => {
    console.log("API su http://localhost:3000")
})
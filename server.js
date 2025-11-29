import express from 'express';


const app = express();

app.listen(3000,'0.0.0.0', () => {
    console.log("API su http://localhost:3000")
})
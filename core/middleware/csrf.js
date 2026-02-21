//Genera e imposta il token CSRF da inviare tramite cookie csrf (Double Submit Cookie) per prevenire attacchi CSRF

import crypto from 'crypto'

//
export const CSRF_COOKIE_OPTIONS = {
    httpOnly: false, // il frontend deve poterlo leggere per inviarlo in X-CSFR-Token
    secure: false, // false in ambiente di sviluppo in quanto non si dispone di https
    sameSite: 'lax',
    maxAge: 7*24*60*60*1000 // 7 giorni
}


export const generateCsrfToken = (req, res) => {
    //console.log(req.cookies)
    // cerco csrf token nel cookie
    let token = req.cookies['csrf_token']

    if (!token) {
        token = crypto.randomBytes(32).toString('hex')

        res.cookie('csrf_token', token, CSRF_COOKIE_OPTIONS)
    }
    return token
}

export const csrf_protection = (req,res,next) => {
    // escludo metodi sicuri,
    if (['GET','HEAD','OPTIONS'].includes(req.method)) {
        return next()
    }
    //console.log("req.cookies['csrf_token']",req.cookies['csrf_token'] )
    //console.log("req.headers:", req.headers)
    //console.log("req.headers['x-csrf-token']", req.headers['x-csrf-token'])
    //console.log("req.headers['X-CSRF-Token']", req.headers['X-CSRF-Token'])
    // tento di estrarre il token

    const cookie_token = (req.cookies['csrf_token'] || '').trim() // T1 recuperato dal cookie inviato automaticamente dal browser (grazie a cookie-parser).
    const header_token = (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'] || req.headers['X-CSRF-Token'] || '').trim() //Viene recuperato dall'header HTTP X-CSRF-Token (inviato dal codice JavaScript del frontend)
    
    
    if(!cookie_token || !header_token || cookie_token!=header_token) {
        return res.status(403).json({error: 'CSRF Token non valido'})
    }
    next()
}
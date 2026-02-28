// sistema di logging tramite libreria Winston

import winston from 'winston'
import 'winston-daily-rotate-file'

const transport = new winston.transports.DailyRotateFile({
  dirname: 'logs',                      // cartella dei log, se non esiste la crea
  filename: 'app-%DATE%.log',           // nome con data
  datePattern: 'YYYY-MM-DD',            // rotazione giornaliera
  zippedArchive: false,                 // Se true, comprime i vecchi log in .gz
  maxSize: '20m',
  maxFiles: '14d'                       // conserva 14 giorni
})

const logger = winston.createLogger({
  level: 'info', // identifica la la soglia di sensibilità, al di sotto della quale i messaggi verranno ignorati
  format: winston.format.combine( // composizione del log
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport
  ]
})

export default logger

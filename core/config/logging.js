import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  dirname: 'logs',                // cartella dei log
  filename: 'app-%DATE%.log',           // nome con data
  datePattern: 'YYYY-MM-DD',            // rotazione giornaliera
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d'                       // conserva 14 giorni
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport
  ]
});

export default logger;

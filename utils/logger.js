const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

// 1. Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  // include stack trace for errors
  return `${timestamp} [${level}]: ${stack || message}`;
});

// 2. Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),    // capture stack trace
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),              // colorful console output
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      )
    }),
    // write all logs with level `info` and below to `logs/app.log`
    new transports.File({ filename: 'logs/app.log', level: 'info' }),
    // write `error` level logs to `logs/error.log`
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // optional: daily rotation
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

module.exports = logger;

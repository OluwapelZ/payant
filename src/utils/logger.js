const appRoot = require('app-root-path');
const winston = require('winston');

const options = {
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
    file: {
      level: 'info',
      filename: `${appRoot}/logs/app.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: '[Base-Service]' }),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize({ all: true }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new winston.transports.Console(options.console),
      new winston.transports.File(options.file),
    ]
});

logger.stream = {
    write: function(message) {
       // 'info' log level => transports (file and console)
      logger.info(message);
    },
};

module.exports = logger;
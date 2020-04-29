const winston = require('winston');

const options = {
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
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
      new winston.transports.Console(options.console)
    ]
});

logger.stream = {
    write: function(message) {
      logger.info(message);
    },
};

module.exports = logger;
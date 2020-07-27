const { createLogger, format, transports } = require('winston');

const logger = new createLogger({
  format: format.combine(format.splat(), format.simple()),
  transports: [
    new transports.Console({
      timestamp: true,
      colorize: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions,
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;

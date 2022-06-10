const winston = require('winston');
const consoleTransport = new winston.transports.Console();
const winstonOptions = {
    transports: [consoleTransport]
};
const logger = new winston.createLogger(winstonOptions);

module.exports = logger;
require('dotenv').config();

const logger = require('./logger');
const processCsv = require('./processCsv');

(async () => {
    await processCsv();
})();
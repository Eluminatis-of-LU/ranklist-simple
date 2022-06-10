require('dotenv').config();

const processCsv = require('./processCsv');

(async () => {
    await processCsv();
})();
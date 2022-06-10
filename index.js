require('dotenv').config();

const processCsv = require('./processCsv');

const cron = require('node-cron');

(async () => {
    await processCsv();
})();

// cron.schedule('0 */6 * * *', async () => {
//     await processCsv();
// });

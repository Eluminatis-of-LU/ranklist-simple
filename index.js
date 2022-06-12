require('dotenv').config();

const logger = require('./logger');
const processCsv = require('./processCsv');

const cron = require('node-cron');

const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
    logger.info('ping-ponged');
    res.send('pong');
});

app.listen(port, () => logger.info(`ranklist-simple listening on port ${port}!`));

(async () => {
    await processCsv();
})();

cron.schedule(process.env.CRON, async () => {
    logger.info('starting scheduled job for processing csv');
    await processCsv();
    logger.info('finished scheduled job for processing csv');
});
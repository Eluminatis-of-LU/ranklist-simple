const needle = require('needle');
const logger = require('./logger');
const cfUrl = 'http://codeforces.com/api/user.rating?handle=';

async function GetRating(userName) {
    try {
        logger.info(userName + ' calling cf');
        const res = await needle('get', cfUrl + userName);
        if (res.body.status !== 'OK' || (res.body.result || []).length === 0) {
            throw new Error(`Can't find contest for username: ${userName}`);
        }
        const lastContest = res.body.result[res.body.result.length - 1];
        logger.info(lastContest);
        return {
            rating: lastContest.newRating,
            ratingUpdateTimeSeconds: lastContest.ratingUpdateTimeSeconds
        };
    }
    catch (err) {
        logger.error(err);
        return {
            rating: 0,
            ratingUpdateTimeSeconds: null,
        };
    }
}

module.exports = {
    GetRating,
}
const needle = require('needle');
const logger = require('./logger');
const ccUrl = 'https://codechef-api.eluminatis-of-lu.com/rating/';

async function GetRating(userName) {
    try {
        const res = await needle('get', ccUrl + userName);
        
        logger.info(res.body);
        if (res.statusCode !== 200) {
            throw new Error(`Can't find contest for username: ${userName}`);
        }
        return {
            rating: res.body.rating,
            ratingUpdateTimeSeconds: res.body.lastParticipationTimeStamp
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
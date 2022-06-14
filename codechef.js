const needle = require('needle');
const logger = require('./logger');
const ccUrl = process.env.CC_API_URL;

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

function GetRank(rating) {
    if( !rating || rating < 1400 ) return 'cc-1star';
    else if( rating < 1600 ) return 'cc-2star';
    else if( rating < 1800 ) return 'cc-3star';
    else if( rating < 2000 ) return 'cc-4star';
    else if( rating < 2200 ) return 'cc-5star';
    else if( rating < 2500 ) return 'cc-6star';
    else return 'cc-7star';
}

module.exports = {
    GetRating,
    GetRank,
}
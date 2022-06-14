const needle = require('needle');
const logger = require('./logger');
const cfUrl = process.env.CF_API_URL;

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

function GetRank(rating) {
    if( !rating || rating < 1200 ) return 'cf-newbie';
    else if( rating < 1400 ) return 'cf-pupil';
    else if( rating < 1600 ) return 'cf-specialist';
    else if( rating < 1900 ) return 'cf-expert';
    else if( rating < 2100 ) return 'cf-candidate-master';
    else if( rating < 2300 ) return 'cf-master';
    else if( rating < 2400 ) return 'cf-international-master';
    else if( rating < 2600 ) return 'cf-grandmaster';
    else if( rating < 3000 ) return 'cf-internation-grandmaster';
    else return 'cf-legendary-grandmaster';
}

module.exports = {
    GetRating,
    GetRank,
}
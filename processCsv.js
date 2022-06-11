require('dotenv').config();
const fs = require('fs');
const fse = require('fs-extra');
const logger = require('./logger');
const codeforces = require('./codeforces');
const codechef = require('./codechef');
const ejs = require('ejs');

const fileName = process.env.DATA_FILE;
const cfFactor = process.env.CF_FACTOR;
const ccFactor = process.env.CC_FACTOR;

function ValidateRating(rt) {
    const lastContestDate = new Date(rt.ratingUpdateTimeSeconds * 1000);
    const timeStampNow = new Date();
    const lastDisallowedDate = new Date();
    lastDisallowedDate.setMonth(timeStampNow.getMonth() - 1);
	return (lastDisallowedDate > lastContestDate) ? 0 : rt.rating;
}

async function UpdateRow(row) {
    const cf = await codeforces.GetRating(row[2]);
    const cc = await codechef.GetRating(row[3]);
    row[4] = ValidateRating(cf);
    row[5] = ValidateRating(cc);
    row[6] = (row[4] * cfFactor) + (row[5] * ccFactor) + Number.parseFloat(row[7]);
    row[6] = row[6].toFixed(2);
}
    
function WriteCsvSync(file, data) {
    fse.outputFileSync(file, data.map(row => row.join(',')).join('\n'), 'utf-8');
}

function CreateHtmlSync(rows) {
    const columns = ['Rank', 'Name', 'Id', 'CodeForces', 'CodeChef', 'Rating'];
    const rankList = [];
    for (let i = 1; i < rows.length; i++) {
        rankList.push({
            Rank: 0,
            Name: rows[i][0],
            Id: rows[i][1],
            CodeForces: {
                Handle: rows[i][2],
                Rank: codeforces.GetRank(rows[i][4]),
            },
            CodeChef: {
                Handle: rows[i][3],
                Rank: codechef.GetRank(rows[i][5]),
            },
            Rating: rows[i][6],
        });
    }
    ranklist = rankList.sort((a, b) => Math.sign(b[5] - a[5]));
    rankList.map((row, ind, array) => {
        logger.info(row);
        if (ind == 0) array[ind][0] = ind + 1;
        else if (array[ind][5] !== array[ind - 1][5]) array[ind][0] = ind + 1;
        else array[ind][0] = array[ind - 1][0];
        return array[ind];
    })
    logger.info(rankList);
    const template = fs.readFileSync('./template.ejs').toString();
    const html = ejs.render(template, {
        columns: columns,
        rows: rankList,
    });
    fse.outputFileSync(process.env.DIST, html, 'utf-8');
}

async function Process() {
    const file = fs.readFileSync(fileName);
    try {
        const rows = [];
        
        file.toString().split('\n').map(el => el.trim()).filter(Boolean).forEach(line => {
            rows.push(line.split(',').map(el => el.trim()));
        });

        logger.info('rows', rows);
        
        for (let i = 1; i < rows.length; i++) {
            await UpdateRow(rows[i]);
        }
        WriteCsvSync(fileName, rows);
        CreateHtmlSync(rows);
    } catch (err) {
        logger.error(err.message);
        logger.error('Processing failed, rolling back');
        fse.outputFileSync(fileName, file);
    }
}

module.exports = Process;
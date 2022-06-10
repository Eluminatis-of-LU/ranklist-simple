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
    
function WriteCsv(file, data) {
    fs.writeFile(file, data.map(row => row.join(',')).join('\n'), 'utf-8', err => err ? logger.error(err) : 0);
}

function CreateHtml(rows) {
    const columns = ['Rank', 'Name', 'Id', 'CodeForces', 'CodeChef', 'Rating'];
    const rankList = [];
    for (let i = 1; i < rows.length; i++) {
        rankList.push([0, rows[i][0], rows[i][1], rows[i][2], rows[i][3], rows[i][6]]);
    }
    ranklist = rankList.sort((a, b) => Math.sign(b[5] - a[5]));
    rankList.map((row, ind, array) => {
        console.log(row);
        if (ind == 0) array[ind][0] = ind + 1;
        else if (array[ind][5] !== array[ind - 1][5]) array[ind][0] = ind + 1;
        else array[ind][0] = array[ind - 1][0];
        return array[ind];
    })
    console.log(rankList);
    const html = ejs.render(
`<table>
    <thead>
        <tr>
            <% for (let i = 0; i < columns.length; i++) { %>
            <th><%= columns[i] %></th>
            <% } %>
        </tr>
    </thead>
    <thead>
        <% for (let i = 0; i < rows.length; i++) { %>
        <tr>
            <% for (let j = 0; j < rows[i].length; j++) { %>
                <td><%= rows[i][j] %></td>
            <% } %>
        </tr>
        <% } %>
    </thead>
</table>
`, {
        columns: columns,
        rows: rankList,
    });
    fse.outputFile(process.env.DIST, html, 'utf-8', err => err ? logger.error(err) : 0);
}

async function Process() {
    const file = fs.readFileSync(fileName);
    try {
        const rows = [];
        const lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(fileName)
        });
        
        lineReader.on('line', function (line) {
            rows.push(line.split(',').map(el => el.trim()));
        });

        lineReader.on('close', async function() {
            for (let i = 1; i < rows.length; i++) {
                await UpdateRow(rows[i]);
            }
            WriteCsv(fileName, rows);
            CreateHtml(rows);
        });
    } catch (err) {
        logger.error(err);
        logger.error('Processing failed, rolling back');
        fse.outputFileSync(fileName, file);
    }
}

module.exports = Process;
const http = require('http');
const querystring = require('querystring');
const axios = require('axios');
const moment = require('moment-timezone');

function getAccessToken(apiKey, username, password) {
    const url = 'https://api.8x8.com/analytics/work/v1/oauth/token';
    const headers = {
        '8x8-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    const data = querystring.stringify({
        'username': username,
        'password': password
    });

    return axios.post(url, data, { headers })
        .then(response => {
            if (response.status === 200) {
                return response.data.access_token;
            } else {
                throw new Error(`Error getting access token: ${response.status}, ${response.data}`);
            }
        });
}

function getCallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version) {
    const url = `https://api.8x8.com/analytics/work/${version}/call-records`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        '8x8-apikey': apiKey
    };
    const params = {
        'pbxId': pbxId,
        'startTime': startTime,
        'endTime': endTime,
        'timeZone': timeZone,
        'pageSize': 150
    };

    return axios.get(url, { headers, params })
        .then(response => {
            if (response.status === 200) {
                return response.data.data;
            } else {
                throw new Error(`Error getting call records: ${response.status}, ${response.data}`);
            }
        });
}

function extractInformation(callRecords) {
    return callRecords.map(record => ({
        callee: record.callee || '',
        talkTime: record.talkTime || '',
        callerName: record.callerName || ''
    }));
}

function main() {
    const apiKey = 'eght_NWRmYzc0MzQtNDFlMy00MDI2LTlkMjItZmM1NTg0NDgzYzc3';
    const username = 'Unblinded.Mastery';
    const password = 'UBMastery711@x!!';
    const pbxId = 'unblindedmastery882';
    const startTime = moment().tz('America/New_York').subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment().tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
    const timeZone = 'America/New_York';
    const version = 'v2';

    getAccessToken(apiKey, username, password)
        .then(accessToken => getCallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version))
        .then(callRecords => {
            const extractedInfo = extractInformation(callRecords);
            extractedInfo.forEach(recordInfo => console.log(recordInfo));
        })
        .catch(error => console.error(error));
}

// Set up a simple HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, this is your Node.js server!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

if (require.main === module) {
    main();
}

const http = require('http');
const querystring = require('querystring');
const axios = require('axios');
const moment = require('moment-timezone');

const PORT = process.env.PORT || 3000;

function getAccessToken(clientId, clientSecret, username, password) {
    const url = 'https://login.salesforce.com/services/oauth2/token';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    const data = querystring.stringify({
        'grant_type': 'password',
        'client_id': clientId,
        'client_secret': clientSecret,
        'username': username,
        'password': password
    });

    return axios.post(url, data, { headers })
        .then(response => {
            if (response.status === 200) {
                const accessToken = response.data.access_token;
                return accessToken;
            } else {
                throw new Error(`Error getting Salesforce access token: ${response.status}, ${response.data}`);
            }
        });
}


// Function to create records in Salesforce
function createSalesforceRecord(salesforceAccessToken, recordInfo) {
    const url = 'https://unblindedmastery.my.salesforce.com/services/data/v58.0/sobjects/Invite_Team_Activity__c'; // Replace with your Salesforce instance URL
    console.log(`Salesforce Access Token: ${salesforceAccessToken}`);
    console.log('8x8 Call Records:', recordInfo);

    const record = {
        Phone__c: recordInfo.callee,
        talkTime__c: recordInfo.talkTime,
        callerName__c: recordInfo.callerName
    };

    const headers = {
        'Authorization': `Bearer ${salesforceAccessToken}`,
        'Content-Type': 'application/json'
    };

    axios.post(url, record, { headers })
        .then(response => {
            console.log(`Salesforce record created successfully: ${response.data.id}`);
        })
        .catch(error => {
            console.error(`Error creating Salesforce record: ${error.message}`);
        });
}

// Function to get 8x8 access token
function get8x8AccessToken(apiKey, username, password) {
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
                throw new Error(`Error getting 8x8 access token: ${response.status}, ${response.data}`);
            }
        });
}

// Function to get 8x8 call records
function get8x8CallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version) {
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
                throw new Error(`Error getting 8x8 call records: ${response.status}, ${response.data}`);
            }
        });
}

// Function to extract information from 8x8 call records
function extractInformation(callRecords) {
    return callRecords.map(record => ({
        callee: record.callee || '',
        talkTime: record.talkTime || '',
        callerName: record.callerName || ''
    }));
}

// Main function to orchestrate the process
function main() {
    // Salesforce credentials
    const salesforceClientId = '3MVG9p1Q1BCe9GmBa.vd3k6U6tisbR1DMPjMzaiBN7xn.uqsguNxOYdop1n5P_GB1yHs3gzBQwezqI6q37bh9';
    const salesforceClientSecret = '1AAD66E5E5BF9A0F6FCAA681ED6720A797AC038BC6483379D55C192C1DC93190';
    const salesforceUsername = 'admin@unblindedmastery.com';
    const salesforcePassword = 'Unblinded2023$';

    // 8x8 credentials
    const apiKey = 'eght_NWRmYzc0MzQtNDFlMy00MDI2LTlkMjItZmM1NTg0NDgzYzc3';
    const username = 'Unblinded.Mastery';
    const password = 'UBMastery711@x!!';
    const pbxId = 'unblindedmastery882';
    const startTime = moment().tz('America/New_York').subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment().tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
    const timeZone = 'America/New_York';
    const version = 'v2';

    // Get Salesforce access token
    getAccessToken(salesforceClientId, salesforceClientSecret, salesforceUsername, salesforcePassword)
        .then(salesforceAccessToken => {
            // Get 8x8 access token
            return get8x8AccessToken(apiKey, username, password)
                .then(accessToken => {
                    // Get 8x8 call records
                    return get8x8CallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version);
                })
                .then(callRecords => {
                    const extractedInfo = extractInformation(callRecords);
                    // Use Salesforce access token to create records
                    extractedInfo.forEach((recordInfo, index) => {
                        setTimeout(() => {
                            createSalesforceRecord(salesforceAccessToken, recordInfo);
                        }, index * 2000); // 2000 milliseconds (2 seconds) delay
                    });
                });
        })
        .catch(error => console.error(error));
}

// Set up a simple HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});


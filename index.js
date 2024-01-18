const http = require('http');
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const axios = require('axios');

async function getAccessToken(apiKey, username, password) {
  const url = 'https://api.8x8.com/analytics/work/v1/oauth/token';
  const headers = {
    '8x8-apikey': apiKey,
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  const data = {
    'username': username,
    'password': password
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error(`Error getting access token: ${response.status}, ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Error getting access token: ${error.message}`);
  }
}

async function getCallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version) {
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

  try {
    const response = await axios.get(url, { headers, params });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error(`Error getting call records: ${response.status}, ${response.data}`);
    }
  } catch (error) {
    throw new Error(`Error getting call records: ${error.message}`);
  }
}

function extractInformation(callRecords) {
  const extractedInfo = [];

  for (const record of callRecords) {
    const callee = record.callee || '';
    const talkTime = record.talkTime || '';
    const callerName = record.callerName || '';

    const recordInfo = {
      'callee': callee,
      'talkTime': talkTime,
      'callerName': callerName
    };

    extractedInfo.push(recordInfo);
  }

  return extractedInfo;
}

async function main() {
  const apiKey = 'eght_NWRmYzc0MzQtNDFlMy00MDI2LTlkMjItZmM1NTg0NDgzYzc3';
  const username = 'Unblinded.Mastery';
  const password = 'UBMastery711@x!!';
  const pbxId = 'unblindedmastery882';
  const startTime = '2024-01-16 09:00:00';
  const endTime = '2024-01-16 10:00:00';
  const timeZone = 'America/New_York';
  const version = 'v2';

  try {
    const accessToken = await getAccessToken(apiKey, username, password);
    const callRecords = await getCallRecords(apiKey, accessToken, pbxId, startTime, endTime, timeZone, version);
    const extractedInfo = extractInformation(callRecords);

    extractedInfo.forEach(recordInfo => {
      console.log(recordInfo);
    });
  } catch (error) {
    console.error(error.message);
  }
}

if (require.main === module) {
  main();
}

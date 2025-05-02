// functions/getStatus.js

const { google } = require('googleapis');
const {
  SPREADSHEET_ID,
  RANGE_ALL
} = require('./constants');

exports.handler = async () => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 시트 전체(A2:D11) 데이터를 읽어옵니다
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_ALL,
    });

    const rows = res.data.values || [];
    const statuses = rows.map(row => ({
      name:          row[0],              // A열: 이름
      submitted:     row[1] === '✅',     // B열: 제출 여부
      submittedTime: row[2] || '미제출',  // C열: 제출 시간
      phone:         row[3] || ''         // D열: 휴대폰
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(statuses),
    };
  } catch (error) {
    console.error('Error fetching status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

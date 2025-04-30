// getStatus.js
const { google } = require('googleapis');

exports.handler = async () => {
  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
    const RANGE = 'kensol_sinteam!A2:C11'; // A, B, C 열을 가져옴

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const data = res.data.values;

    const statuses = data.map(row => ({
      name: row[0],       // 이름
      submitted: row[1] === '✅', // 제출 여부
      submittedTime: row[2] || '미제출' // 제출 시간
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

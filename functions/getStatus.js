const { google } = require('googleapis');
const path = require('path');

exports.handler = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '../service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
  const RANGE = 'Sheet1!A2:B11'; // A: 이름 / B: 제출 여부

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE
  });

  const rows = res.data.values || [];
  const data = rows.map(r => ({ name: r[0], submitted: r[1] === '✅' }));

  return { statusCode: 200, body: JSON.stringify(data) };
};

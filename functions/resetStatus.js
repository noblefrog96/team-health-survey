const { google } = require('googleapis');
const {
  SPREADSHEET_ID,
  RANGE_SUBMITTED,
  RANGE_SUBMITTED_TIME,
  ROW_COUNT
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

    // 빈 배열로 제출 여부(B) 와 제출 시간(C) 모두 초기화
    const resetData = Array(ROW_COUNT).fill(['']);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_SUBMITTED,           // B2:B11
      valueInputOption: 'RAW',
      requestBody: { values: resetData },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_SUBMITTED_TIME,      // C2:C11
      valueInputOption: 'RAW',
      requestBody: { values: resetData },
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Error resetting status/time:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

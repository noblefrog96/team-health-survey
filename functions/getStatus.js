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
    const RANGE = 'kensol_sinteam!A2:D11';

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const data = res.data.values || [];

    // 시간 문자열을 'AM 02:36:10' 형식으로 변환하는 함수
    function formatAMPM(timeStr) {
      const date = new Date(timeStr.replace(' ', 'T'));
      if (isNaN(date)) return null;

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hourStr = String(hours).padStart(2, '0');
      return `${ampm} ${hourStr}:${minutes}:${seconds}`;
    }

    const statuses = data.map(row => {
      const submitted = row[1] === '✅';
      const timeFormatted = row[2] ? formatAMPM(row[2]) : null;

      return {
        name: row[0],
        submitted,
        submittedTime: submitted && timeFormatted ? `✅ ${timeFormatted}` : null,
        phone: row[3] || null
      };
    });

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

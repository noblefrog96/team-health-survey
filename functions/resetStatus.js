// team-health-survey/functions/resetStatus.js

const { google } = require('googleapis');

exports.handler = async () => {
  try {
    // 서비스 계정 키를 환경 변수에서 가져옴!
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // 구글 인증 객체 생성
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // 클라이언트 생성
    const client = await auth.getClient();

    // Google Sheets API 클라이언트 생성
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 스프레드시트 ID와 초기화할 범위 설정
    const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
    const RANGE_SUBMITTED = 'kensol_sinteam!B2:B11';  // 제출 여부가 있는 열
    const RANGE_SUBMITTED_TIME = 'kensol_sinteam!C2:C11';  // 제출 시간 열

    // 제출 여부와 제출 시간 초기화
    const resetData = Array(10).fill(['']); // 빈 값으로 초기화

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_SUBMITTED,
      valueInputOption: 'RAW',
      requestBody: { values: resetData },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_SUBMITTED_TIME,
      valueInputOption: 'RAW',
      requestBody: { values: resetData },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error in resetting survey status and time:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

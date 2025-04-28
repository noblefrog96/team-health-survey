const { google } = require('googleapis');
const path = require('path');

exports.handler = async () => {
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

  // 스프레드시트 ID와 읽을 범위 설정
  const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
  const RANGE = 'Sheet1!A2:B11'; // A: 이름 / B: 제출 여부

  // 스프레드시트 데이터를 가져오기
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE
  });

  // 데이터를 가공하여 반환
  const rows = res.data.values || [];
  const data = rows.map(r => ({ name: r[0], submitted: r[1] === '✅' }));

  return { statusCode: 200, body: JSON.stringify(data) };
};

// survey.js
const axios = require('axios');
const qs = require('qs');
const { google } = require('googleapis');

exports.handler = async (event) => {
  try {
    const { name } = JSON.parse(event.body);

    // ✅ 1. 회사 구글폼 자동 제출 (이제 서버에서 대신 요청)
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zicXdV113lzuk7Qe78ncIcmpEpN8QHK33m4k_-lqoMtbPg/formResponse';
    const formData = {
      'entry.2099356774': '케이엔솔',
      'entry.1432170741': name, // 동적으로 이름 넣기
      'entry.761078236': 'FFU 자동제어 설치',
      'entry.1435088501': '위 개인정보 수집이용에 동의합니다',
      'entry.1110756743': '아니오',
      'entry.1248319582': '아니오',
      'entry.1534055340': '아니오',
      'entry.1560227807': '아니오',
      'entry.1622475889': '아니오',
      'entry.606234188': '아니오',
      'entry.487055317': '복용중인 약 없음'
    };

    await axios.post(FORM_URL, qs.stringify(formData), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // ✅ 2. 스프레드시트에 ✅ 기록
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:A11'
    });

    const names = sheetData.data.values.flat();
    const idx = names.indexOf(name);
    if (idx !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!B${idx + 2}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['✅']] }
      });
    }

    // ✅ 3. 성공 응답
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: '제출이 완료되었습니다!' })
    };
    
  } catch (error) {
    console.error('Error in survey submission:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: '제출 실패!', error: error.message })
    };
  }
};

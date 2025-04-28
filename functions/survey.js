const { google } = require('googleapis');
const axios = require('axios');
const qs = require('qs');
const path = require('path');

exports.handler = async (event) => {
  const { name } = JSON.parse(event.body);

  // 1) 회사 구글폼 자동 제출 (entry.XXX는 개발자도구에서 복사)
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zicXdV113lzuk7Qe78ncIcmpEpN8QHK33m4k_-lqoMtbPg/formResponse';
// survey.js 내 formData 예시
  const formData = {
    // 01. 협력사명 (드롭다운)
    'entry.2099356774': '케이엔솔',
  
    // 02. 이름 (단답형 텍스트)
    'entry.1432170741': '박지율',
  
    // 03. 금일 작업 내용 (단답형 텍스트)
    'entry.761078236': 'FFU 자동제어 설치',
  
    // 04. 개인정보 수집 동의서 (체크박스)
    'entry.1435088501': '위 개인정보 수집이용에 동의합니다',
  
    // 보행 중 통증(골반·무릎 등)
    'entry.1110756743': '아니오',
  
    // [심혈관계] … 흉통 증상
    'entry.1248319582': '아니오',
  
    // [뇌혈관계] 두통·어지러움 등
    'entry.1534055340': '아니오',
  
    // 심한 떨림·저림 등
    'entry.1560227807': '아니오',
  
    // 호흡이 빨라지거나 무기력감 등
    'entry.1622475889': '아니오',
  
    // [소화기계] 설사, 메스꺼움, 복부통증, 구토 등의 증상이 있습니까?
    'entry.606234188': '아니오',
  
    // 약 복용 여부
    'entry.487055317': '복용중인 약 없음'
  };

  await axios.post(FORM_URL, qs.stringify(formData), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  // 2) 스프레드시트에 ✅ 기록
  const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, '../service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
  const list = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A2:A11'
  });
  const names = list.data.values.flat();
  const idx = names.indexOf(name);
  if (idx !== -1) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!B${idx+2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['✅']] }
    });
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};

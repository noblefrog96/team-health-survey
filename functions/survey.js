const { google } = require('googleapis');
const axios = require('axios');
const qs = require('qs');
const path = require('path');

exports.handler = async (event) => {
  const { name } = JSON.parse(event.body);

  // 1) 회사 구글폼 자동 제출 (entry.XXX는 개발자도구에서 복사)
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zicXdV113lzuk7Qe78ncIcmpEpN8QHK33m4k_-lqoMtbPg/formResponse';
  const formData = {
    'entry.111111111': '케이엔솔 (전기)',
    'entry.222222222': name,
    'entry.333333333': 'FFU 자동제어 설치',
    'entry.444444444': '위 개인정보 수집 이용에 동의합니다.',
    'entry.555555555': '아니오',
    'entry.666666666': '아니오',
    'entry.777777777': '아니오',
    'entry.888888888': '아니오',
    'entry.999999999': '아니오',
    'entry.101010101': '아니오',
    'entry.111213141': '복용중인 약 없음'
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

  const SPREADSHEET_ID = '【여기에_스프레드시트_ID_붙여넣기】';
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

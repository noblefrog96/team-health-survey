// team-health-survey/functions/survey.js
const axios = require('axios');
const qs = require('qs');
const { google } = require('googleapis');

// 한국 시간 AM/PM + 시:분 포맷 (초 제외)
function formatKST() {
  const d = new Date(Date.now() + (9*60 - new Date().getTimezoneOffset())*60000);
  let h = d.getHours(), ampm = 'AM';
  if (h === 0) h = 12;
  else if (h >= 12) { ampm = 'PM'; if (h > 12) h -= 12; }
  const m = d.getMinutes().toString().padStart(2,'0');
  return `${ampm} ${h.toString().padStart(2,'0')}:${m}`;
}

exports.handler = async (event) => {
  try {
    const { name, phone: selectedPhone } = JSON.parse(event.body);

    // 1) 시트에서 이름-휴대폰 검증
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'kensol_sinteam!A2:D',
    });
    const rows = sheetData.data.values || [];
    const idx = rows.findIndex(r => r[0] === name);
    if (idx === -1) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: '이름을 찾을 수 없습니다.' }) };
    }
    const correctPhone = rows[idx][3] || '';
    if (selectedPhone !== correctPhone) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: '휴대폰 번호를 다시 확인해주세요.' }) };
    }

    // 2) 구글폼 자동 제출 (기존)
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zicXdV113lzuk7Qe78ncIcmpEpN8QHK33m4k_-lqoMtbPg/formResponse';
    const formData = {
      'entry.2099353174': '케이엔솔',
      'entry.1432170741': name,
      'entry.1010120211': selectedPhone,
      'entry.761078236': 'FFU 자동제어 설치',
      'entry.1435088501': '위 개인정보 수집이용에 동의합니다',
      // ... 이하 예/아니오 체크들
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

    // 3) 스프레드시트에 ✅ + 시간 기록
    const time = formatKST();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `kensol_sinteam!B${idx+2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['✅']] }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `kensol_sinteam!C${idx+2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[time]] }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: '제출이 완료되었습니다!' })
    };
  } catch (error) {
    console.error('Error in survey submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: '제출 실패!', error: error.message })
    };
  }
};

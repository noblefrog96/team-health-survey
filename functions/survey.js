import { formatKST } from './functions/formatKST.js';

const axios = require('axios');
const qs = require('qs');
const { google } = require('googleapis');
const {
  SPREADSHEET_ID,
  SHEET_NAME,
  RANGE_ALL,
  FORM_URL,
  FORM_DATA_TEMPLATE
} = require('./constants');

exports.handler = async (event) => {
  try {
    const { name, phone: selectedPhone } = JSON.parse(event.body);

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 전체 데이터 조회
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_ALL,
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

    const alreadySubmitted = rows[idx][1] === '✅';
    if (alreadySubmitted) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, message: '이미 제출되었습니다.' })
      };
    }

    // 구글폼 제출
    await axios.post(FORM_URL, qs.stringify(FORM_DATA_TEMPLATE(name, selectedPhone)), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const time = formatKST();
    const rowNumber = idx + 2;

    // ✅ 및 시간 기록 (batchUpdate 한 번으로 묶기)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: `${SHEET_NAME}!B${rowNumber}`,  // 제출 여부 열
            values: [['✅']],
          },
          {
            range: `${SHEET_NAME}!C${rowNumber}`,  // 제출 시간 열
            values: [[time]],
          }
        ]
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: '제출이 완료되었습니다!' })
    };
  } catch (error) {
    console.error('Error in survey submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: '제출 실패! 지율이에게 문의하세요.', error: error.message })
    };
  }
};

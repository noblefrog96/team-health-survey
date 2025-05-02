// ───────────────────────────────────────────────────
// Google Sheets 관련 상수
// ───────────────────────────────────────────────────
exports.SPREADSHEET_ID = '1BZ5tMYdt8yHVyPz58J-B7Y5aLd9-ukGbeu7hd_BHTYI';

// 시트 이름
exports.SHEET_NAME = 'kensol_sinteam';

// A2:D11 범위 (이름, 제출여부, 제출시간, 휴대폰)
exports.RANGE_ALL = `${exports.SHEET_NAME}!A2:D11`;

// 제출 여부 초기화 범위 (B2:B11)
exports.RANGE_SUBMITTED = `${exports.SHEET_NAME}!B2:B11`;

// 제출 시간 초기화 범위 (C2:C11)
exports.RANGE_SUBMITTED_TIME = `${exports.SHEET_NAME}!C2:C11`;

// ───────────────────────────────────────────────────
// Google Forms 관련 상수
// ───────────────────────────────────────────────────
exports.FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc5zicXdV113lzuk7Qe78ncIcmpEpN8QHK33m4k_-lqoMtbPg/formResponse';

/**
 * formData 템플릿 생성 함수
 * @param {string} name  제출자 이름
 * @param {string} phone 제출자 휴대폰
 */
exports.FORM_DATA_TEMPLATE = (name, phone) => ({
  'entry.2099353174': '케이엔솔',                // 협력사명
  'entry.1432170741': name,                     // 이름
  'entry.1010120211': phone,                    // 휴대폰
  'entry.761078236': 'FFU 자동제어 설치',        // 작업 내용
  'entry.1435088501': '위 개인정보 수집이용에 동의합니다', // 개인정보 동의
  // 이하 모두 “아니오” 고정
  'entry.1110756743': '아니오',
  'entry.1248319582': '아니오',
  'entry.1534055340': '아니오',
  'entry.1560227807': '아니오',
  'entry.1622475889': '아니오',
  'entry.606234188': '아니오',
  'entry.487055317':  '복용중인 약 없음'
});

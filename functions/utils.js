// functions/utils.js

/**
 * 현재 KST 시간을 'AM 12:48' 형식으로 반환
 */
exports.formatKST = () => {
  const d = new Date(Date.now() + (9 * 60 - new Date().getTimezoneOffset()) * 60000);
  let h = d.getHours(), ampm = 'AM';
  if (h === 0) h = 12;
  else if (h >= 12) {
    ampm = 'PM';
    if (h > 12) h -= 12;
  }
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${ampm} ${h.toString().padStart(2, '0')}:${m}`;
};

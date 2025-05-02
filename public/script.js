import { formatKST } from './functions/utils.js';

const list = document.getElementById('team-list');
const dateTime = document.getElementById('date-time');

// 오늘 날짜만 표시
function updateDateTime() {
  const now = new Date();
  const dayNames = ["일","월","화","수","목","금","토"];
  const formattedDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} (${dayNames[now.getDay()]})`;
  dateTime.textContent = `${formattedDate}`;
}
updateDateTime();

async function fetchStatus() {
  const res = await fetch('/.netlify/functions/getStatus');
  return res.ok ? res.json() : [];
}

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function handleSubmit(name, phone, btn, selectEl, statusDiv) {

  // 1) "제출 중..." 표시
  btn.textContent = '제출 중...';
  btn.disabled = true;
  selectEl.disabled = true;

   // 2) 실제 서버 제출
   try {
     const res = await fetch('/.netlify/functions/survey', {
       method:'POST',
       headers:{ 'Content-Type':'application/json' },
       body: JSON.stringify({ name, phone })
     });
     const result = await res.json();
     if (!result.success) throw new Error(result.message);
    // ✅ 성공 메시지 alert
    alert(result.message);
   } catch (err) {
     console.error(err);
     // 실패 메시지 alert
     alert(err.message || '제출 중 오류가 발생했습니다.');
    // 실패 시 버튼/셀렉트 원복
    btn.textContent = '제출';
    btn.disabled = false;
    selectEl.disabled = false;
     return;
   }

  // 3) 성공 시 로컬 상태 업데이트
  statusDiv.textContent = formatKST();  // ✅ AM 00:52
  btn.textContent = '제출됨';

   // 4) 5초 뒤 백그라운드 전체 리렌더
   setTimeout(async () => {
     render(await fetchStatus());
   }, 5000);
 }

function formatPhone(phone) {
  return phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
}

function render(statuses) {
  list.innerHTML = '';
  statuses.forEach(s => {
    const li = document.createElement('li');

    // 이름
    const nameDiv = document.createElement('div');
    nameDiv.textContent = s.name;
    nameDiv.className = 'card-name';

    // 상태 (❌ 미제출 or ✅ 시간)
    const statusDiv = document.createElement('div');
    statusDiv.className = 'card-status';
    statusDiv.textContent = s.submitted
      ? `✅ ${s.submittedTime}`
      : '❌ 미제출';

    // 휴대폰 드롭다운: 자기 번호 + 랜덤 4개
    const phoneSelect = document.createElement('select');
    phoneSelect.innerHTML = `<option value="">휴대폰 번호</option>`;
    const others = statuses.map(x => x.phone).filter(p => p && p !== s.phone);
    const sample = shuffle(others).slice(0, 4).concat(s.phone);
    shuffle(sample).forEach(p => {
      phoneSelect.innerHTML += `<option value="${p}">${formatPhone(p)}</option>`;
    });

    if (s.submitted) phoneSelect.disabled = true;

    // 버튼
    const btn = document.createElement('button');
    btn.textContent = s.submitted ? '제출됨' : '제출';
    btn.disabled = s.submitted;
    btn.onclick = () => {
      if (phoneSelect.value !== s.phone) {
        alert('휴대폰 번호를 다시 확인해주세요.');
        return;
      }
      handleSubmit(s.name, s.phone, btn, phoneSelect, statusDiv);
    };

    // append
    li.append(nameDiv, statusDiv, phoneSelect, btn);
    list.append(li);
  });
}

(async () => {
  render(await fetchStatus());
})();

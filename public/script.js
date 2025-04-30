const list = document.getElementById('team-list');
const dateTime = document.getElementById('date-time');

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

async function handleSubmit(name, phone, btn, phoneSelect) {
  btn.textContent = '제출 중...'; btn.disabled = true;
  const res = await fetch('/.netlify/functions/survey', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ name, phone })
  });
  const result = await res.json();
  alert(result.message);
  render(await fetchStatus());
}

// Fisher–Yates shuffle 함수
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function render(statuses) {
  list.innerHTML = '';
  statuses.forEach(s => {
    const li = document.createElement('li');

    const nameDiv = document.createElement('div');
    nameDiv.textContent = s.name;

    const statusDiv = document.createElement('div');
    statusDiv.textContent = s.submitted ? ✅ s.submittedTime : '❌';

    const phoneSelect = document.createElement('select');
    const shuffledPhones = shuffle(statuses.map(x => x.phone));
    phoneSelect.innerHTML = shuffledPhones
      .map(p => `<option value="${p}">${p}</option>`)
      .join('');
    phoneSelect.value = '';

    if (s.submitted) phoneSelect.disabled = true;

    const btnDiv = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = s.submitted ? '제출완료' : '제출';
    btn.disabled = s.submitted;
    btn.onclick = () => {
      if (phoneSelect.value !== s.phone) {
        alert('휴대폰 번호를 다시 확인해주세요.');
        return;
      }
      handleSubmit(s.name, s.phone, btn, phoneSelect);
    };
    btnDiv.appendChild(btn);

    li.append(nameDiv, statusDiv, phoneSelect, btnDiv);
    list.append(li);
  });
}

(async() => { render(await fetchStatus()); })();

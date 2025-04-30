const list = document.getElementById('team-list');
const dateTime = document.getElementById('date-time');

function updateDateTime() {
  const now = new Date();
  const dayNames = ["일","월","화","수","목","금","토"];
  const formattedDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} (${dayNames[now.getDay()]})`;
  dateTime.textContent = `오늘은 ${formattedDate}입니다.`;
}
updateDateTime();

async function fetchStatus() {
  const res = await fetch('/.netlify/functions/getStatus');
  return res.ok ? res.json() : [];
}

async function handleSubmit(name, phone, btn) {
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

function render(statuses) {
  list.innerHTML = '';
  statuses.forEach(s => {
    const li = document.createElement('li');

    const nameDiv = document.createElement('div');
    nameDiv.textContent = s.name;

    const statusDiv = document.createElement('div');
    const text = s.submitted
      ? `✅ ${s.submittedTime}`
      : '❌';
    statusDiv.textContent = text;

    const phoneSelect = document.createElement('select');
    phoneSelect.innerHTML = statuses
      .map(x => `<option value="${x.phone}">${x.phone}</option>`)
      .join('');
    phoneSelect.value = '';

    const btnDiv = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = s.submitted ? '제출완료' : '제출';
    btn.disabled = s.submitted;
    btn.onclick = () => {
      if (phoneSelect.value !== s.phone) {
        alert('휴대폰 번호를 다시 확인해주세요.');
        return;
      }
      handleSubmit(s.name, s.phone, btn);
    };
    btnDiv.appendChild(btn);

    li.append(nameDiv, statusDiv, phoneSelect, btnDiv);
    list.append(li);
  });
}

(async() => { render(await fetchStatus()); })();

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

async function handleSubmit(name, phone, btn, phoneSelect) {
  btn.textContent = '제출 중...'; 
  btn.disabled = true;
  phoneSelect.disabled = true;
  
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
-    const li = document.createElement('li');
+    const li = document.createElement('li');
+    li.classList.add('card');

     // 이름
-    const nameDiv = document.createElement('div');
-    nameDiv.textContent = s.name;
+    const nameField = document.createElement('div');
+    nameField.classList.add('field');
+    nameField.innerHTML = `
+      <span class="field-label">이름</span>
+      <span class="field-value">${s.name}</span>
+    `;

     // 상태
-    const statusDiv = document.createElement('div');
-    statusDiv.classList.add('status');
-    statusDiv.textContent = s.submitted
-      ? `✅ ${s.submittedTime}`
-      : '❌';
+    const statusField = document.createElement('div');
+    statusField.classList.add('field');
+    statusField.innerHTML = `
+      <span class="field-label">제출 현황</span>
+      <span class="field-value">${s.submitted ? `✅ ${s.submittedTime}` : '❌'}</span>
+    `;

     // 휴대폰 드롭다운
-    const phoneSelect = document.createElement('select');
+    const phoneField = document.createElement('div');
+    phoneField.classList.add('field');
+    const phoneSelect = document.createElement('select');
     const shuffled = shuffle(statuses.map(x => x.phone));
     phoneSelect.innerHTML = shuffled
       .map(p => `<option value="${p}">${p}</option>`)
       .join('');
     phoneSelect.value = '';
     if (s.submitted) phoneSelect.disabled = true;
+    phoneField.innerHTML = `<span class="field-label">휴대폰 번호</span>`;
+    phoneField.appendChild(phoneSelect);

     // 버튼
-    const btnDiv = document.createElement('div');
-    const btn = document.createElement('button');
+    const actionField = document.createElement('div');
+    actionField.classList.add('field');
+    const btn = document.createElement('button');
     btn.textContent = s.submitted ? '제출완료' : '제출';
     btn.disabled = s.submitted;
     btn.onclick = () => {
       if (phoneSelect.value !== s.phone) {
         alert('휴대폰 번호를 다시 확인해주세요.');
         return;
       }
       handleSubmit(s.name, s.phone, btn, phoneSelect);
     };
-    btnDiv.appendChild(btn);
+    actionField.appendChild(btn);

-    li.append(nameDiv, statusDiv, phoneSelect, btnDiv);
+    li.append(nameField, statusField, phoneField, actionField);
     list.append(li);
   });
 }


(async () => { render(await fetchStatus()); })();

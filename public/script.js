const team = ["박지율", "윤하늘", "신현민", "양대종", "강신용", "박병철", "마경아", "변상규", "김진용", "한창석"];
const list = document.getElementById('team-list');
const dateTime = document.getElementById('date-time'); // 날짜와 시간을 표시할 요소

// 오늘 날짜와 시간 표시
function updateDateTime() {
  const now = new Date();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const formattedDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} (${dayNames[now.getDay()]})`;
  const formattedTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  dateTime.textContent = `오늘은 ${formattedDate}이고, 현재 시간은 ${formattedTime}입니다.`;
}

updateDateTime(); // 페이지 로드 시 날짜와 시간 표시

async function fetchStatus() {
  const res = await fetch('/.netlify/functions/getStatus');
  return res.ok ? res.json() : [];
}

function render(statuses) {
  list.innerHTML = '';
  team.forEach(name => {
    const s = statuses.find(x => x.name === name);
    const li = document.createElement('li');
    li.textContent = name;
    const span = document.createElement('span');
    span.textContent = s?.submitted ? '✅' : '❌';
    const btn = document.createElement('button');
    btn.textContent = '제출';
    btn.disabled = s?.submitted;
    btn.onclick = async () => {
      btn.disabled = true;
      await fetch('/.netlify/functions/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      render(await fetchStatus());
    };
    li.append(span, btn);
    list.append(li);
  });
}

(async () => {
  render(await fetchStatus());
})();

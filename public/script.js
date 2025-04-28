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

async function handleSubmit(name, btn) {
  try {
    // 버튼 텍스트를 "제출 중..."으로 변경하고 비활성화
    btn.textContent = '제출 중...';
    btn.disabled = true;

    const response = await fetch('/.netlify/functions/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    const result = await response.json();  // 서버에서 반환된 응답을 JSON으로 변환

    if (result.success) {
      alert(result.message);  // 성공 메시지 출력
    } else {
      alert(result.message);  // 실패 메시지 출력
    }

    // 제출 후 버튼 텍스트를 "제출완료"로 변경하고 비활성화 처리
    render(await fetchStatus());  // 상태를 다시 렌더링하여 버튼을 비활성화 상태로 갱신

  } catch (error) {
    console.error('Error:', error);
    alert('서버와의 통신 중 오류가 발생했습니다.');
  }
}

function render(statuses) {
  list.innerHTML = '';
  team.forEach(name => {
    const s = statuses.find(x => x.name === name);
    const li = document.createElement('li');
    li.textContent = name;

    // 제출 시간 표시
    const timeSpan = document.createElement('span');
    timeSpan.classList.add('time');
    timeSpan.textContent = s?.submittedTime || '미제출';

    const span = document.createElement('span');
    span.textContent = s?.submitted ? '✅' : '❌';
    
    const btn = document.createElement('button');
    if (s?.submitted) {
      btn.textContent = '제출완료';  // 제출 완료 후 버튼 텍스트 변경
      btn.disabled = true;  // 버튼 비활성화
    } else {
      btn.textContent = '제출';
      btn.disabled = false;  // 제출되지 않으면 버튼 활성화
    }

    btn.onclick = () => handleSubmit(name, btn);  // 서버에 데이터 보내는 함수 호출

    li.append(span, timeSpan, btn); // 시간도 추가
    list.append(li);
  });
}

(async () => {
  render(await fetchStatus());
})();

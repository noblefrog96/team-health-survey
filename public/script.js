const team = ["박지율", "윤하늘", "신현민", "양대종", "강신용", "박병철", "마경아", "변상규", "김진용", "한창석"];
const list = document.getElementById('team-list');

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

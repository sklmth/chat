const socket = io();
let myNick = '';

const messages = document.getElementById('messages');
const input = document.getElementById('input');
const form = document.getElementById('form');

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('zh', { hour: '2-digit', minute: '2-digit' });
}

function appendMsg({ nickname, content, time }) {
  const isMine = nickname === myNick;
  const div = document.createElement('div');
  div.className = `msg ${isMine ? 'mine' : 'other'}`;
  div.innerHTML = `<span class="nick">${isMine ? '你' : nickname} · ${formatTime(time)}</span>
    <div class="bubble">${escHtml(content)}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendSystem(text) {
  const div = document.createElement('div');
  div.className = 'system-msg';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

socket.on('init', ({ nickname, history }) => {
  myNick = nickname;
  document.getElementById('my-nick').textContent = nickname;
  history.forEach(appendMsg);
});

socket.on('message', appendMsg);
socket.on('system', appendSystem);

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit('message', text);
  input.value = '';
});

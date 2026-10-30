/* eslint-env browser */
import { $, formatTime } from '../utils.js';
import { state } from '../state.js';

function messageElement(m) {
  const box = document.createElement('div');

  box.className = 'msg' + (m.author === state.user ? ' own' : '');

  const meta = document.createElement('div');

  meta.className = 'meta';

  const author = document.createElement('span');

  author.className = 'author';
  author.textContent = m.author;

  const time = document.createElement('time');

  time.dateTime = new Date(m.ts).toISOString();
  time.textContent = formatTime(m.ts);
  time.title = new Date(m.ts).toLocaleString('pt-BR');

  meta.append(author, time);

  const text = document.createElement('div');

  text.className = 'text';
  text.textContent = m.text;

  box.append(meta, text);

  return box;
}

const nearBottom = (el) =>
  el.scrollHeight - el.scrollTop - el.clientHeight < 80;

export function renderMessages(toBottom) {
  const box = $('#messages');
  const stick = toBottom || nearBottom(box);

  box.textContent = '';

  if (!state.msgs.length) {
    const empty = document.createElement('p');

    empty.className = 'empty';
    empty.textContent = 'Nenhuma mensagem ainda. Escreva a primeira.';
    box.appendChild(empty);

    return;
  }

  state.msgs.forEach((m) => box.appendChild(messageElement(m)));

  if (stick) {
    box.scrollTop = box.scrollHeight;
  }
}

export function appendMessage(m) {
  const box = $('#messages');
  const stick = nearBottom(box) || m.author === state.user;
  const empty = box.querySelector('.empty');

  if (empty) {
    empty.remove();
  }
  box.appendChild(messageElement(m));

  if (stick) {
    box.scrollTop = box.scrollHeight;
  }
}

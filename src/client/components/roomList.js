/* eslint-env browser */
import { $, fail } from '../utils.js';
import { state, currentRoom } from '../state.js';
import { api } from '../api.js';

export function closeSidebar() {
  document.body.classList.remove('side-open');
}

export function renderTitle() {
  const room = currentRoom();

  $('#roomTitle').textContent = room ? room.name : '';

  $('#composerInput').placeholder = room
    ? 'Mensagem para ' + room.name
    : 'Escreva uma mensagem';
}

function actionButton(label, onClick) {
  const b = document.createElement('button');

  b.type = 'button';
  b.className = 'act';
  b.textContent = label;
  b.addEventListener('click', onClick);

  return b;
}

export function renderRooms(onJoin) {
  const ul = $('#rooms');

  ul.textContent = '';

  state.rooms.forEach((room) => {
    const li = document.createElement('li');

    if (room.id === state.current) {
      li.className = 'active';
    }

    const join = document.createElement('button');

    join.type = 'button';
    join.className = 'join';
    join.textContent = room.name;
    join.title = 'Entrar em ' + room.name;

    join.addEventListener('click', () => {
      onJoin(room.id);
      closeSidebar();
    });

    const rename = actionButton('Renomear', () => {
      const newName = prompt('Novo nome da sala', room.name);

      if (newName === null) {
        return;
      }
      api('PATCH', '/api/rooms/' + room.id, { name: newName }).catch(fail);
    });

    const del = actionButton('Excluir', () => {
      if (
        !confirm(
          'Excluir a sala "' + room.name + '" e todas as suas mensagens?',
        )
      ) {
        return;
      }
      api('DELETE', '/api/rooms/' + room.id).catch(fail);
    });

    li.append(join, rename, del);
    ul.appendChild(li);
  });
}

export function initNewRoomForm(onCreated) {
  $('#newRoom').addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = $('#newRoomName');

    try {
      const data = await api('POST', '/api/rooms', { name: input.value });

      input.value = '';
      onCreated(data.room);
      closeSidebar();
    } catch (err) {
      fail(err);
    }
  });
}

/**
 * rooms.js — Handlers de salas (Socket.IO + UI).
 *
 * Responsabilidades:
 * - Renderizar a lista de salas na sidebar
 * - Lidar com eventos room:list, room:default, room:destroyed, room:created
 * - Criar salas via formulário
 * - Entrar em salas ao clicar
 *
 * @module rooms
 */

/* eslint-env browser */

import { socket, state } from './state.js';
import { openRenameModal } from './modal.js';
import { closeMobileSidebar } from './mobile.js';

/**
 * Inicializa todos os handlers de sala.
 * Chamado uma única vez pelo app.js na inicialização.
 */
export function initRoomHandlers() {
  const roomList = document.getElementById('roomList');
  const currentRoomName = document.getElementById('currentRoomName');
  const createRoomForm = document.getElementById('createRoomForm');
  const newRoomInput = document.getElementById('newRoomInput');

  // room:default — Recebe o ID da sala padrão "Geral"
  socket.on('room:default', ({ roomId }) => {
    state.defaultRoomId = roomId;
  });

  // room:list — Renderiza a sidebar com destaque na sala ativa
  socket.on('room:list', (rooms) => {
    roomList.innerHTML = '';

    rooms.forEach((room) => {
      const item = document.createElement('div');
      const isActive = room.id === state.currentRoomId;

      item.className = 'room-item' + (isActive ? ' active' : '');
      item.dataset.roomId = room.id;

      // Nome da sala
      const nameSpan = document.createElement('span');

      nameSpan.className = 'room-name';
      nameSpan.textContent = room.name;

      // Botões de ação (renomear, excluir)
      const actions = document.createElement('div');

      actions.className = 'room-actions';

      // Não mostra ações na sala padrão "Geral"
      if (room.id !== state.defaultRoomId) {
        const renameBtn = document.createElement('button');

        renameBtn.textContent = '✏️';
        renameBtn.title = 'Renomear';

        renameBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openRenameModal(room.id, room.name);
        });

        const deleteBtn = document.createElement('button');

        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Excluir';
        deleteBtn.className = 'delete';

        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          socket.emit('room:delete', { roomId: room.id });
        });

        actions.appendChild(renameBtn);
        actions.appendChild(deleteBtn);
      }

      item.appendChild(nameSpan);
      item.appendChild(actions);

      // Click para entrar na sala
      item.addEventListener('click', () => {
        if (room.id !== state.currentRoomId) {
          socket.emit('room:join', { roomId: room.id });
          state.currentRoomId = room.id;
          currentRoomName.textContent = room.name;
          closeMobileSidebar();

          // Atualiza destaque visual
          document.querySelectorAll('.room-item').forEach((el) => {
            el.classList.remove('active');
          });
          item.classList.add('active');
        }
      });

      roomList.appendChild(item);
    });

    // Se ainda não está em nenhuma sala, entra na padrão
    if (!state.currentRoomId && state.defaultRoomId) {
      state.currentRoomId = state.defaultRoomId;

      const defaultRoom = rooms.find((r) => r.id === state.defaultRoomId);

      if (defaultRoom) {
        currentRoomName.textContent = defaultRoom.name;
      }
    }
  });

  // room:destroyed — Sala excluída, redireciona para "Geral"
  socket.on('room:destroyed', ({ redirectTo }) => {
    state.currentRoomId = redirectTo;
    currentRoomName.textContent = 'Geral';
  });

  // room:created — Sala criada com sucesso, entra automaticamente
  socket.on('room:created', (room) => {
    state.currentRoomId = room.id;
    currentRoomName.textContent = room.name;
    socket.emit('room:join', { roomId: room.id });
  });

  // Criar sala via formulário
  createRoomForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const roomName = newRoomInput.value.trim();

    if (!roomName) {
      return;
    }

    socket.emit('room:create', { name: roomName });
    newRoomInput.value = '';
  });
}

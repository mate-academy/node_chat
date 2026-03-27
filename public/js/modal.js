/**
 * modal.js — Modal de renomear sala.
 *
 * Responsabilidades:
 * - Abrir/fechar o modal de rename
 * - Enviar evento room:rename ao confirmar
 * - Atalhos de teclado (Enter para confirmar, Escape para fechar)
 *
 * @module modal
 */

/* eslint-env browser */

import { socket, state } from './state.js';

const renameModal = document.getElementById('renameModal');
const renameInput = document.getElementById('renameInput');
const renameCancelBtn = document.getElementById('renameCancelBtn');
const renameConfirmBtn = document.getElementById('renameConfirmBtn');

/**
 * Abre o modal de renomear preenchido com o nome atual.
 * @param {string} roomId - ID da sala a renomear
 * @param {string} currentName - Nome atual da sala
 */
export function openRenameModal(roomId, currentName) {
  state.renameTargetId = roomId;
  renameInput.value = currentName;
  renameModal.classList.add('active');
  renameInput.focus();
}

/**
 * Fecha o modal de renomear e limpa o estado.
 */
export function closeRenameModal() {
  renameModal.classList.remove('active');
  state.renameTargetId = null;
}

/**
 * Inicializa os event listeners do modal.
 * Chamado uma única vez pelo app.js na inicialização.
 */
export function initModalHandlers() {
  const currentRoomName = document.getElementById('currentRoomName');

  // Botão cancelar
  renameCancelBtn.addEventListener('click', closeRenameModal);

  // Botão confirmar
  renameConfirmBtn.addEventListener('click', () => {
    const newName = renameInput.value.trim();

    if (!newName || !state.renameTargetId) {
      return;
    }

    socket.emit('room:rename', {
      roomId: state.renameTargetId,
      name: newName,
    });

    // Se é a sala ativa, atualiza o header
    if (state.renameTargetId === state.currentRoomId) {
      currentRoomName.textContent = newName;
    }

    closeRenameModal();
  });

  // Enter para confirmar rename
  renameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      renameConfirmBtn.click();
    }
  });

  // Escape para fechar modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && renameModal.classList.contains('active')) {
      closeRenameModal();
    }
  });
}

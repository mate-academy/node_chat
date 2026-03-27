/**
 * messages.js — Handlers de mensagens (Socket.IO + UI).
 *
 * Responsabilidades:
 * - Receber histórico e novas mensagens do servidor
 * - Enviar mensagens pelo formulário
 * - Atualizar contagem de usuários online
 *
 * @module messages
 */

/* eslint-env browser */

import { socket } from './state.js';
import { renderMessages, appendMessage, scrollToBottom } from './ui.js';

/**
 * Inicializa todos os handlers de mensagem.
 * Chamado uma única vez pelo app.js na inicialização.
 */
export function initMessageHandlers() {
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const onlineCount = document.getElementById('onlineCount');

  // room:history — Recebe histórico ao entrar na sala
  socket.on('room:history', (messages) => {
    renderMessages(messages);
  });

  // message:new — Nova mensagem em tempo real
  socket.on('message:new', (message) => {
    appendMessage(message);
    scrollToBottom();
  });

  // user:list — Atualiza contagem de online
  socket.on('user:list', (users) => {
    onlineCount.textContent = users.length + ' online';
  });

  // Enviar mensagem via formulário
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();

    if (!text) {
      return;
    }

    socket.emit('message:send', { text });
    messageInput.value = '';
    messageInput.focus();
  });
}

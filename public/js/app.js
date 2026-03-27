/**
 * app.js — Orquestrador principal do Chat.
 *
 * Módulo raiz que importa e inicializa todos os sub-módulos.
 * Responsabilidades:
 * - Gerenciar fluxo de username (localStorage + join)
 * - Reconexão automática via Socket.IO
 * - Inicializar rooms, messages, modal e mobile
 *
 * @module app
 */

/* eslint-env browser */

import { socket, state } from './state.js';
import { initRoomHandlers } from './rooms.js';
import { initMessageHandlers } from './messages.js';
import { initModalHandlers } from './modal.js';
import { initMobileHandlers } from './mobile.js';

// === Referências DOM (apenas as do fluxo de username) ===
const usernameScreen = document.getElementById('usernameScreen');
const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const usernameError = document.getElementById('usernameError');
const chatApp = document.getElementById('chatApp');
const messageInput = document.getElementById('messageInput');

// === Fluxo de Username ===

/**
 * Envia o username ao servidor e aguarda resposta.
 * Se sucesso → mostra chat. Se erro → mostra mensagem.
 * @param {string} userName - Nome de usuário desejado
 */
function joinWithUsername(userName) {
  socket.emit('user:join', { username: userName }, (response) => {
    if (response && response.success) {
      state.username = userName;
      localStorage.setItem('chat_username', userName);
      usernameScreen.style.display = 'none';
      chatApp.classList.add('active');
      messageInput.focus();
      usernameError.textContent = '';
    } else {
      usernameError.textContent = response
        ? response.error
        : 'Erro ao conectar';
      usernameScreen.style.display = '';
      chatApp.classList.remove('active');
    }
  });
}

// Formulário de username
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const userName = usernameInput.value.trim();

  if (!userName) {
    return;
  }

  joinWithUsername(userName);
});

// === Reconexão automática ===
socket.on('connect', () => {
  if (state.username && !usernameScreen.style.display) {
    joinWithUsername(state.username);

    if (state.currentRoomId) {
      socket.emit('room:join', { roomId: state.currentRoomId });
    }
  }
});

// === Inicializar todos os módulos ===
initRoomHandlers();
initMessageHandlers();
initModalHandlers();
initMobileHandlers();

// === Auto-login se já tiver username salvo ===
if (state.username) {
  usernameInput.value = state.username;
  joinWithUsername(state.username);
}

/**
 * ui.js — Funções de renderização de mensagens.
 *
 * Responsabilidades:
 * - Renderizar histórico de mensagens
 * - Adicionar mensagens individuais ao DOM
 * - Scroll automático para o final
 * - Prevenção de XSS (escapeHtml)
 *
 * @module ui
 */

/* eslint-env browser */

import { state } from './state.js';

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto seguro para innerHTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}

/**
 * Rola o container de mensagens para o final.
 */
export function scrollToBottom() {
  const container = document.getElementById('messagesContainer');

  container.scrollTop = container.scrollHeight;
}

/**
 * Adiciona uma mensagem ao container.
 * @param {{ author: string, text: string, time: string }} msg
 */
export function appendMessage(msg) {
  const container = document.getElementById('messagesContainer');

  // Remove o empty state se existir
  const empty = container.querySelector('.empty-state');

  if (empty) {
    empty.remove();
  }

  const isOwn = msg.author === state.username;
  const div = document.createElement('div');

  div.className = 'message' + (isOwn ? ' own' : '');

  const time = new Date(msg.time);
  const timeStr = time.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  div.innerHTML = `
    <div class="message-header">
      <span class="message-author">${escapeHtml(msg.author)}</span>
      <span class="message-time">${timeStr}</span>
    </div>
    <div class="message-bubble">${escapeHtml(msg.text)}</div>
  `;

  container.appendChild(div);
}

/**
 * Renderiza todas as mensagens de uma sala (histórico completo).
 * @param {{ author: string, text: string, time: string }[]} messages
 */
export function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">💬</div>
        <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
      </div>
    `;

    return;
  }

  container.innerHTML = '';
  messages.forEach((msg) => appendMessage(msg));
  scrollToBottom();
}

/**
 * state.js — Estado global compartilhado e conexão Socket.IO.
 *
 * Centraliza todas as variáveis de estado do cliente
 * e a instância do socket para que os demais módulos
 * importem a mesma referência.
 *
 * @module state
 */

/* eslint-env browser */
/* global io */

// === Conexão Socket.IO ===
export const socket = io();

// === Estado mutável do cliente ===
export const state = {
  username: localStorage.getItem('chat_username') || '',
  currentRoomId: null,
  defaultRoomId: null,
  renameTargetId: null,
};

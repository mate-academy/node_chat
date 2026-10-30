/* eslint-env browser */
import { $ } from '../utils.js';
import { state, LS_USER } from '../state.js';
import { api } from '../api.js';
import { renderMessages } from './messageList.js';

export function renderMe() {
  $('#meName').textContent = state.user || '—';
}

export function showGate() {
  $('#gateError').textContent = '';
  $('#gate').hidden = false;
  $('#gateInput').value = state.user;
  $('#gateInput').focus();
  $('#gateInput').select();
}

export function initUsername() {
  $('#gateForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const data = await api('POST', '/api/username', {
        username: $('#gateInput').value,
      });

      state.user = data.username;
      localStorage.setItem(LS_USER, state.user);
      $('#gate').hidden = true;
      renderMe();
      renderMessages(false);
      $('#composerInput').focus();
    } catch (err) {
      $('#gateError').textContent = err.message;
    }
  });

  $('#changeName').addEventListener('click', showGate);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.user && !$('#gate').hidden) {
      $('#gate').hidden = true;
    }
  });

  if (!state.user) {
    showGate();
  }
  renderMe();
}

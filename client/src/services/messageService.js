import { httpClient } from '../http/httpClient.js';

function send(text, roomId) {
  const username = localStorage.getItem('username');
  return httpClient.post('/messages', { text, username, roomId });
}

export const messageService = { send };

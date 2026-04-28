import { httpClient } from '../http/httpClient.js';

async function save(username) {
  await httpClient.post('/users', { username });
  localStorage.setItem('username', username);
}

export const userService = { save };

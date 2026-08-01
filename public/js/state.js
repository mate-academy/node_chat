'use strict';

export const state = {
  username: localStorage.getItem('username') || '',
  rooms: [],
  activeRoomId: null,
};

export function setUsername(username) {
  state.username = username;
  localStorage.setItem('username', username);
}

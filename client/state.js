export const state = {
  user:  window.localStorage.getItem('username') || null,
  rooms: [],
  activeRoom: null,
  messages: [],
};

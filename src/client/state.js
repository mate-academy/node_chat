/* eslint-env browser */
export const LS_USER = 'chat:username';
export const LS_ROOM = 'chat:room';

export const state = {
  user: localStorage.getItem(LS_USER) || '',
  rooms: [],
  current: localStorage.getItem(LS_ROOM) || null,
  msgs: [],
};

export const currentRoom = () =>
  state.rooms.find((r) => r.id === state.current);

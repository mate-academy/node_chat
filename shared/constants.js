const EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  ROOM_CREATE: 'room:create',
  ROOM_RENAME: 'room:rename',
  ROOM_DELETE: 'room:delete',
  ROOM_JOIN: 'room:join',
  ROOM_LIST: 'room:list',

  MSG_SEND: 'msg:send',
  MSG_NEW: 'msg:new',
  MSG_HISTORY: 'msg:history',

  ERROR: 'error',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EVENTS };
} else {
  window.EVENTS = EVENTS;
}

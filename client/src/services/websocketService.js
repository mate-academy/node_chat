/* global WebSocket */

const WS_URL = 'ws://localhost:3008';

export const createWebSocket = () => {
  return new WebSocket(WS_URL);
};

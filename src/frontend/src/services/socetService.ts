import type { SocketMessage } from '../type/SocketMessage';

type Socket = WebSocket | null;

let socket: Socket = null;

function socketConnect() {
  if (!socket) {
    socket = new WebSocket('ws://localhost:3007');
  }

  return socket;
}

const createSystemMessage = <T extends keyof SocketMessage>(
  type: T,
  payload: SocketMessage[T],
) => {
  return JSON.stringify({
    type,
    payload,
  });
};

export const socketService = {
  socketConnect,
  createSystemMessage,
};

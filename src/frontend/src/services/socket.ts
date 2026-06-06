type Socket = WebSocket | null;

let socket: Socket = null;

function connect() {
  if (!socket) {
    socket = new WebSocket('ws://localhost:3005');
  }

  return socket;
}

export const socketService = {
  connect,
};

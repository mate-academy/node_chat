const PORT = 3003;

export const socket = new WebSocket(`ws://localhost:${PORT}`);

socket.onopen = () => {
  console.log('Connected to WebSocket server');
};

export function sendData(message, name, room) {
  socket.send(
    JSON.stringify({
      message,
      name,
      room,
    }),
  );
}

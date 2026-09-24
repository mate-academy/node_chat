const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
  console.log('WebSocket connection opened');
});

export function onMessage(callback) {
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  });
};


export function joinRoom(room) {
  socket.send(JSON.stringify({
    type: 'join-room',
    room
  }));
};

export function leaveRoom() {
  socket.send(JSON.stringify({
    type: 'leave-room'
  }));
}

export function sendMessage(message) {
  socket.send(JSON.stringify(message));
};

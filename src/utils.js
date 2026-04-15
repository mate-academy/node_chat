const WebSocket = require('ws');
const { rooms } = require('./store');

function broadcastRooms(wss) {
  const roomList = Object.values(rooms).map((r) => ({
    id: r.id,
    name: r.name,
  }));
  const message = JSON.stringify({ type: 'ROOMS_LIST', rooms: roomList });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastToRoom(wss, roomId, messageObj) {
  const message = JSON.stringify(messageObj);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(message);
    }
  });
}

module.exports = { broadcastRooms, broadcastToRoom };

// eslint-disable-next-line no-shadow
const { WebSocketServer, WebSocket } = require('ws');

const messageRooms = new Map();
const roomSubscribers = new Map();

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const e = JSON.parse(data);

      if (e.type === 'joinRoom') {
        const { roomId } = e;

        if (!messageRooms.has(roomId)) {
          messageRooms.set(roomId, new Set());
        }

        messageRooms.get(roomId).add(ws);

        ws.roomId = roomId;
      }

      if (e.type === 'subscribeRooms') {
        const { userId } = e;

        if (!roomSubscribers.has(userId)) {
          roomSubscribers.set(userId, new Set());
        }

        roomSubscribers.get(userId).add(ws);

        ws.userId = userId;
      }
    });

    ws.on('close', () => {
      if (ws.roomId && messageRooms.has(ws.roomId)) {
        messageRooms.get(ws.roomId).delete(ws);
      }

      if (ws.userId && roomSubscribers.has(ws.userId)) {
        roomSubscribers.get(ws.userId).delete(ws);
      }
    });
  });
}

function sendToRoom(roomId, data) {
  const clients = messageRooms.get(roomId);

  if (!clients) {
    return;
  }

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function sendToRoomList(userId, data) {
  const clients = roomSubscribers.get(userId);

  if (!clients) {
    return;
  }

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = {
  initWebSocket,
  sendToRoom,
  sendToRoomList,
};

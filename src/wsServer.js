const { WebSocketServer } = require('ws');
const { userRoomService } = require('./services/userRoom.service.js');
const { messageService } = require('./services/message.service.js');

const rooms = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (connection) => {
    let roomId = null;
    let userId = null;

    connection.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'join') {
          roomId = data.room;
          userId = data.userId;

          const isMember = await userRoomService.findMember({ userId, roomId });

          if (!isMember) {
            return connection.send(
              JSON.stringify({
                type: 'error',
                message: 'You are not in this room',
              }),
            );
          }

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
          }
          rooms.get(roomId).add(connection);

          const messages = await messageService.getAllMessages({ roomId });

          connection.send(JSON.stringify({ type: 'history', messages }));
        }

        if (data.type === 'message' && roomId) {
          const msg = await messageService.create({
            userId,
            roomId,
            text: data.text,
          });

          if (rooms.has(roomId)) {
            rooms.get(roomId).forEach((client) => {
              if (client.readyState === 1) {
                client.send(
                  JSON.stringify({ type: 'message', room: roomId, ...msg }),
                );
              }
            });
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error processing message:', e);
      }
    });

    connection.on('close', () => {
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(connection);

        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
};

module.exports = { rooms, setupWebSocket };

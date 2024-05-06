const roomService = require('../services/room.service.js');
const messageService = require('../services/message.service.js');

const websocket = (wss) => {
  wss.on('connection', (connection) => {
    let roomId;

    connection.on('message', async (newMessage) => {
      try {
        const data = JSON.parse(newMessage);

        if (data.init && data.roomId) {
          roomId = data.roomId;
          connection.roomId = roomId;

          const joinRooms = await roomService.getRoomById(roomId);

          if (joinRooms) {
            const messages = await messageService.getMessagesByRoomId(roomId);

            connection.send(JSON.stringify(messages));
          } else {
            connection.send(JSON.stringify({ error: 'Room not found' }));
          }
        } else {
          if (!roomId) {
            connection.send(JSON.stringify({ error: 'Room not found' }));
          }

          const joinRooms = await roomService.getRoomById(roomId);

          if (joinRooms) {
            const message = await messageService.createMessage({
              userId: data.userId,
              text: data.text,
              roomId,
            });

            wss.clients.forEach((client) => {
              if (client.roomId === roomId) {
                client.send(JSON.stringify(message));
              }
            });
          } else {
            connection.send(JSON.stringify({ error: 'Room not found' }));
          }
        }
      } catch (error) {
        connection.send(JSON.stringify({ error: 'Room not found' }));
      }
    });

    connection.on('close', () => {
      // eslint-disable-next-line no-console
      console.log(`Client left the room ${roomId}`);
    });
  });
};

module.exports = {
  websocket,
};

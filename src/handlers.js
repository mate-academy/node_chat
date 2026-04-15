const { rooms } = require('./store');
const { broadcastRooms, broadcastToRoom } = require('./utils');

function handleMessage(ws, wss, messageAsString) {
  const data = JSON.parse(messageAsString);

  switch (data.type) {
    case 'JOIN_ROOM':
      ws.roomId = data.roomId;
      ws.username = data.username;

      if (!rooms[data.roomId]) {
        rooms[data.roomId] = {
          id: data.roomId,
          name: data.roomId,
          messages: [],
        };
      }

      ws.send(
        JSON.stringify({
          type: 'ROOM_HISTORY',
          roomId: data.roomId,
          messages: rooms[data.roomId].messages,
        }),
      );
      break;

    case 'NEW_MESSAGE':
      if (ws.roomId && rooms[ws.roomId]) {
        const newMessage = {
          id: Date.now().toString(),
          author: ws.username,
          time: new Date().toISOString(),
          text: data.text,
        };

        rooms[ws.roomId].messages.push(newMessage);

        broadcastToRoom(wss, ws.roomId, {
          type: 'MESSAGE',
          roomId: ws.roomId,
          message: newMessage,
        });
      }
      break;

    case 'CREATE_ROOM':
      const newRoomId = 'room_' + Date.now();

      rooms[newRoomId] = { id: newRoomId, name: data.roomName, messages: [] };
      broadcastRooms(wss);
      break;

    case 'RENAME_ROOM':
      if (rooms[data.roomId] && data.roomId !== 'general') {
        rooms[data.roomId].name = data.newName;
        broadcastRooms(wss);
      }
      break;

    case 'DELETE_ROOM':
      if (rooms[data.roomId] && data.roomId !== 'general') {
        delete rooms[data.roomId];

        wss.clients.forEach((client) => {
          if (client.roomId === data.roomId) {
            client.roomId = 'general';
            client.send(JSON.stringify({ type: 'ROOM_DELETED' }));
          }
        });
        broadcastRooms(wss);
      }
      break;
  }
}

module.exports = { handleMessage };

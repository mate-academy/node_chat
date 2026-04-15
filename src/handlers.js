/* eslint-disable no-console */
const { rooms } = require('./store');
const { broadcastRooms, broadcastToRoom } = require('./utils');

function handleMessage(ws, wss, messageAsString) {
  let data;

  try {
    data = JSON.parse(messageAsString);
  } catch (e) {
    console.error('Malformed JSON received');

    return;
  }

  switch (data.type) {
    case 'JOIN_ROOM':
      if (!data.username) {
        return;
      }

      ws.username = data.username;
      ws.roomId = data.roomId || 'general';

      let isNewRoom = false;

      if (!rooms[ws.roomId]) {
        rooms[ws.roomId] = { id: ws.roomId, name: ws.roomId, messages: [] };
        isNewRoom = true;
      }

      ws.send(
        JSON.stringify({
          type: 'ROOM_HISTORY',
          roomId: ws.roomId,
          messages: rooms[ws.roomId].messages,
        }),
      );

      if (isNewRoom) {
        broadcastRooms(wss);
      }

      break;

    case 'NEW_MESSAGE':
      if (ws.username && ws.roomId && rooms[ws.roomId]) {
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

            client.send(
              JSON.stringify({
                type: 'ROOM_HISTORY',
                roomId: 'general',
                messages: rooms['general'].messages,
              }),
            );
          }
        });
        broadcastRooms(wss);
      }
      break;
  }
}

module.exports = { handleMessage };

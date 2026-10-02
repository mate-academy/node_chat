/* eslint-disable no-console */
const { broadcastToRoom, broadcast, sendTo } = require('./send');
const {
  getByRoomId,
  createMessage,
  removeMessages,
} = require('../services/messages.service');
const {
  getRooms,
  getById,
  createRoom,
  renameRoom,
  removeRoom,
} = require('../services/rooms.service');

function setupWebSocket(wss) {
  wss.on('connection', (client) => {
    console.log('Client connected');

    client.on('message', (data) => {
      const message = data.toString();
      let parsedMessage;

      try {
        parsedMessage = JSON.parse(message);
      } catch {
        console.error('Невалідний JSON');

        return;
      }

      switch (parsedMessage.type) {
        case 'message': {
          const room = getById(parsedMessage.roomId);

          if (!room) {
            sendTo(client, {
              type: 'error',
              error: 'Not found room',
            });
            break;
          }

          const newMessage = createMessage(
            parsedMessage.roomId,
            parsedMessage.author,
            parsedMessage.content,
          );

          broadcastToRoom(wss, room.roomId, {
            message: newMessage,
            type: 'message',
          });

          console.log(
            `Author: ${parsedMessage.author} - Message: ${parsedMessage.content}`,
          );
          break;
        }

        case 'getRooms': {
          const rooms = getRooms();

          sendTo(client, {
            rooms,
            type: 'rooms',
          });

          break;
        }

        case 'joinRoom': {
          const room = getById(parsedMessage.roomId);

          if (!room) {
            sendTo(client, {
              type: 'error',
              error: 'Not found room',
            });
            break;
          }

          const messages = getByRoomId(parsedMessage.roomId);

          client.roomId = room.roomId;

          sendTo(client, {
            room,
            messages,
            type: 'roomJoined',
          });
          break;
        }

        case 'createRoom': {
          const owner = parsedMessage.owner ? parsedMessage.owner.trim() : '';
          const name = parsedMessage.name ? parsedMessage.name.trim() : '';

          if (!owner || !name) {
            sendTo(client, {
              type: 'error',
              error: 'Owner and name are required',
            });
            break;
          }

          createRoom(name, owner);

          broadcast(wss, {
            rooms: getRooms(),
            type: 'rooms',
          });

          break;
        }

        case 'renameRoom': {
          const room = getById(parsedMessage.roomId);

          if (!room) {
            sendTo(client, {
              type: 'error',
              error: 'Not found room',
            });
            break;
          }

          if (room.owner !== parsedMessage.owner) {
            sendTo(client, {
              type: 'error',
              error: 'You are not the owner of this room',
            });
            break;
          }

          const newName = parsedMessage.newName
            ? parsedMessage.newName.trim()
            : '';

          if (!newName) {
            sendTo(client, {
              type: 'error',
              error: 'New name is required',
            });
            break;
          }

          renameRoom(parsedMessage.roomId, newName);

          broadcast(wss, {
            rooms: getRooms(),
            type: 'rooms',
          });

          break;
        }

        case 'removeRoom': {
          const room = getById(parsedMessage.roomId);

          if (!room) {
            sendTo(client, {
              type: 'error',
              error: 'Not found room',
            });
            break;
          }

          if (room.owner !== parsedMessage.owner) {
            sendTo(client, {
              type: 'error',
              error: 'You are not the owner of this room',
            });
            break;
          }

          broadcastToRoom(wss, parsedMessage.roomId, {
            roomId: parsedMessage.roomId,
            type: 'roomRemoved',
          });

          const removed = removeRoom(parsedMessage.roomId);

          if (!removed) {
            sendTo(client, {
              type: 'error',
              error: 'Failed to remove room',
            });
            break;
          }
          removeMessages(parsedMessage.roomId);

          broadcast(wss, {
            rooms: getRooms(),
            type: 'rooms',
          });

          break;
        }
        default:
          console.log('Невідомий тип:', parsedMessage.type);
      }
    });
  });
}

module.exports = {
  setupWebSocket,
};

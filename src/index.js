'use strict';

/* eslint-disable no-console */
const uuidV4 = require('uuid').v4;
const { WebSocketServer } = require('ws');
const { EventEmitter } = require('events');

require('dotenv').config();

const { dbService } = require('./services/dbService.js');

const emitter = new EventEmitter();

const wss = new WebSocketServer({ port: process.env.PORT });

wss.on('listening', () => console.log('server started'));

wss.on('connection', (client) => {
  client.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });

  client.on('message', async(data) => {
    const clientData = JSON.parse(data.toString());

    switch (clientData.action) {
      case 'registration':
        const id = uuidV4();

        const confirmation = {
          action: 'confirmation',
          name: clientData.name,
          id,
        };

        client.send(JSON.stringify(confirmation));
        break;

      case 'createRoom':
        try {
          await dbService.createRoom(clientData.title, clientData.userId);

          emitter.emit('sendUpdatedRoomsList');
        } catch (error) {
          const message = `Can't create room`;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        break;

      case 'renameRoom':
        let messageRenameRoom;

        try {
          await dbService.renameRoom(clientData.roomId, clientData.newTitle);

          emitter.emit('sendUpdatedRoomsList');

          messageRenameRoom = {
            action: 'messages',
            room: await dbService.getOneRoom(clientData.roomId),
          };
        } catch (error) {
          const message = `Can't rename room`;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        for (const oneOfClients of wss.clients) {
          if (oneOfClients.roomId === clientData.roomId) {
            oneOfClients.send(JSON.stringify(messageRenameRoom));
          }
        }

        break;

      case 'chooseRoom':
        client.roomId = clientData.id;

        let messageChooseRoom;

        try {
          messageChooseRoom = {
            action: 'messages',
            messages: await dbService.getMessages(clientData.id),
            room: await dbService.getOneRoom(clientData.id),
          };
        } catch (error) {
          const message = `Can't load room`;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        client.send(JSON.stringify(messageChooseRoom));

        break;

      case 'askRoomsList':
        let roomsList;

        try {
          roomsList = {
            action: 'roomsList',
            rooms: await dbService.getAllRooms(),
          };
        } catch (error) {
          const message = `Can't recieve rooms list `;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        client.send(JSON.stringify(roomsList));

        break;

      case 'deleteRoom':
        try {
          await dbService.deleteRoom(clientData.roomId);
        } catch (error) {
          const message = `Server can't delete room`;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        for (const cli of wss.clients) {
          if (cli.roomId === clientData.roomId) {
            cli.send(JSON.stringify({
              action: 'messages',
              messages: [],
              room: null,
            }));

            cli.roomId = null;
          }
        }

        emitter.emit('sendUpdatedRoomsList');
        break;

      case 'newMessage':
        const { author, text, date, roomId } = clientData;

        try {
          await dbService.createMessage(author, text, date, roomId);
        } catch (error) {
          const message = `Server can't add new message`;

          emitter.emit('isError', {
            client, message, error,
          });
        }

        const newMessage = {
          action: 'newMessage',
          message: {
            author,
            text,
            date,
          },
        };

        for (const cli of wss.clients) {
          if (cli.roomId === roomId) {
            cli.send(JSON.stringify(newMessage));
          }
        }

        break;

      default:
    }
  });
});

emitter.on('sendUpdatedRoomsList', async() => {
  let roomsList;

  try {
    roomsList = {
      action: 'roomsList',
      rooms: await dbService.getAllRooms(),
    };
  } catch (error) {
    console.log(error);

    roomsList = {
      action: 'error',
      message: `Can't load new rooms list after update`,
      error,
    };
  }

  for (const client of wss.clients) {
    client.send(JSON.stringify(roomsList));
  }
});

emitter.on('isError', ({ client, message, error }) => {
  console.log(error);

  const err = {
    action: 'error',
    message,
    error,
  };

  client.send(JSON.stringify(err));
});

wss.on('error', (error) => {
  console.error(`Server error: ${error.message}`);
});

'use strict'
const { Server } = require('socket.io');
const roomService = require('./../services/room.service.js');
const userService = require('./../services/user.service.js');
const messageService = require('./../services/message.service.js');

console.log('SOCKET EVENTS FILE LOADED');
const setupSockets = (server) => {
  const io = new Server(server, {
    cors: { origin: '*'},
  });

  io.on('connection', async (socket) => {
    console.log('SOCKET CONNECTED', socket.id);

    socket.emit('room_list',  await roomService.getAllRooms());

    socket.on('room_create', async ({ name, owner }) => {
      try {
        await roomService.createRoom({ name, owner });

        const rooms = await roomService.getAllRooms();
        io.emit('room_list', rooms);
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('room_join', async ({ roomId, userName }) => {
      try {
        const user = await userService.findOrCreateUser(userName);

        socket.userId = user.id
        socket.userName = user.name;
        socket.roomId = roomId;

        const room = await roomService.joinRoom({ roomId });

        socket.join(roomId);

        if (!room) {
          throw new Error('Room not found');
        }

        // const messages = room.Messages.map(msg => ({
        //   id: msg.id,
        //   text: msg.text,
        //   authorName: msg.User.name,
        //   createdAt: msg.createdAt,
        // }));

        socket.emit('message_history', room.Messages.map(m => m.toJSON()));
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('room_rename', async ({ roomId, newName }) => {
      try {
        await roomService.renameRoom({ id: roomId, newName });

        const rooms = await roomService.getAllRooms();
        io.emit('room_list', rooms);
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('room_delete', async ({ roomId }) => {
      try {
        await roomService.deleteRoom({ id: roomId });

        const rooms = await roomService.getAllRooms();
        io.emit('room_list', rooms);
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('message_send', async ({ text }) => {
      try {
        if (!text || !text.trim()) {
          throw new Error('Message is empty');
        }

        if (!socket.userId || !socket.roomId) {
          throw new Error('User is not in room');
        }

        console.log('SEND MESSAGE:', {
          text,
          socketRoomId: socket.roomId,
          socketUserId: socket.userId,
          socketUserName: socket.userName,
        });
        const message = await messageService.createMessage({
          text,
          roomId: socket.roomId,
          authorName: socket.userName,
          userId: socket.userId,
        })

        io.to(socket.roomId).emit('message_new', message.toJSON());
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`${socket.userName} disconnected`);
    })
  });
}

module.exports = setupSockets;

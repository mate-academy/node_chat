import 'dotenv/config';
import { Server } from 'socket.io';

import { Message } from '../models/Message.js';
import { leaveRoom } from './leaveRoom.js';

export const getChat = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_HOST,
      methods: ['GET', 'POST'],
    },
  });

  const CHAT_BOT = 'ChatBot';
  let chatRoomId = '';
  let allUsers = [];

  io.on('connection', (socket) => {
    socket.on('join_room', async(data) => {
      const { userName, roomId } = data;

      if (!userName && !roomId) {
        return;
      }

      socket.join(roomId);

      const message = {
        author: CHAT_BOT,
        time: new Date(),
        text: `${userName} has joined the chat room`,
      };

      const messageToNew = {
        ...message,
        text: `Welcome, ${userName}!`,
      };

      socket.to(roomId).emit('receive_message', message);
      socket.emit('receive_message', messageToNew);

      chatRoomId = roomId;

      const isHere = allUsers.find(currUser => currUser.userName === userName);

      if (!isHere) {
        allUsers.push({
          id: socket.id,
          userName,
          roomId,
        });
      }

      const chatRoomUsers = allUsers
        .filter(currUser => currUser.roomId === roomId)
        .sort((user1, user2) => user1.userName.localeCompare(user2.userName));

      io.to(roomId).emit('chatroom_users', chatRoomUsers);

      try {
        const messages = await Message.findAll({
          where: {
            roomId,
          },
          order: ['time'],
        });

        socket.emit('get_messages', messages);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    });

    socket.on('send_message', (data) => {
      const {
        author,
        text,
        roomId,
      } = data;

      if (!author && !roomId && !text) {
        return;
      }

      const newMessage = {
        author,
        time: new Date(),
        text,
        roomId,
      };

      io.to(roomId).emit('receive_message', newMessage);

      Message.create(newMessage);
    });

    socket.on('leave_room', (data) => {
      const { userName, roomId } = data;

      if (!userName) {
        return;
      }

      socket.leave(roomId);
      allUsers = leaveRoom(socket.id, allUsers);

      socket.to(roomId).emit('receive_message', {
        author: CHAT_BOT,
        time: new Date(),
        text: `${userName} has left the chat`,
      });

      socket.to(roomId).emit('chatroom_users', allUsers);
    });

    socket.on('disconnect', () => {
      const userToDisconnect = allUsers.find(user => user.id === socket.id);

      if (userToDisconnect) {
        allUsers = leaveRoom(socket.id, allUsers);

        socket.to(chatRoomId).emit('receive_message', {
          author: CHAT_BOT,
          time: new Date(),
          text: `${userToDisconnect.userName} has disconnected from the chat`,
        });

        socket.to(chatRoomId).emit('chatroom_users', allUsers);
      }
    });
  });

  return io;
};

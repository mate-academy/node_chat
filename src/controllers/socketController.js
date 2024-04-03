'use strict';

const EventEmitter = require('events');
const { WebSocketServer } = require('ws');
const { sockets } = require('../exceptions/SocketManager');
const { typeSocket } = require('../config');

const socketEmitter = new EventEmitter();

function socketController(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (dataInString) => {
      const data = JSON.parse(dataInString);

      if (data.type === typeSocket.login) {
        return sockets.create(data.userName, ws);
      }
    });

    ws.on('close', () => {
      sockets.removeBySocket(ws);
    });
  });

  socketEmitter.on(typeSocket.chatCreate, (newChat) => {
    const members = newChat.members;
    const message = {
      type: typeSocket.chatCreate,
      chat: newChat,
    };

    sockets.sendToUsers(members, message);
  });

  socketEmitter.on(typeSocket.chatEdit, (updatedChat) => {
    const recipients = updatedChat.members;
    const message = {
      type: typeSocket.chatEdit,
      chat: updatedChat,
    };

    sockets.sendToUsers(recipients, message);
  });

  socketEmitter.on(typeSocket.chatDelete, ({ chatId, recipients }) => {
    const message = {
      type: typeSocket.chatDelete,
      chatId: +chatId,
    };

    sockets.sendToUsers(recipients, message);
  });

  socketEmitter.on(typeSocket.message, ({ newMessage, recipients, chatId }) => {
    const message = {
      type: typeSocket.message,
      message: newMessage,
      chatId: +chatId,
    };

    sockets.sendToUsers(recipients, message);
  });
};

module.exports = {
  socketController, socketEmitter,
};

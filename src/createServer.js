'use strict';

const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws');
const { rooms } = require('./data');

const createServer = (server) => {
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  server.on('request', app);

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'getRooms') {
        ws.send(
          JSON.stringify({
            type: 'rooms',
            rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
          }),
        );
      }

      if (data.type === 'join') {
        const room = rooms.find((r) => r.id === data.roomId);

        ws.roomId = data.roomId;
        ws.username = data.username;

        ws.send(
          JSON.stringify({ type: 'roomHistory', messages: room.messages }),
        );
      }

      if (data.type === 'message') {
        const room = rooms.find((r) => r.id === ws.roomId);
        const newMessage = {
          author: ws.username,
          time: Date.now(),
          text: data.text,
        };

        room.messages.push(newMessage);

        wss.clients.forEach((client) => {
          if (client.roomId === ws.roomId) {
            client.send(
              JSON.stringify({ type: 'newMessage', message: newMessage }),
            );
          }
        });
      }

      if (data.type === 'createRoom') {
        const newRoom = { id: rooms.length + 1, name: data.name, messages: [] };

        rooms.push(newRoom);

        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: 'rooms',
              rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
            }),
          );
        });
      }

      if (data.type === 'renameRoom') {
        const room = rooms.find((r) => r.id === data.roomId);

        room.name = data.newName;

        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: 'rooms',
              rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
            }),
          );
        });
      }

      if (data.type === 'deleteRoom') {
        const roomIndex = rooms.findIndex((r) => r.id === data.roomId);

        rooms.splice(roomIndex, 1);

        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: 'rooms',
              rooms: rooms.map((r) => ({ id: r.id, name: r.name })),
            }),
          );
        });
      }
    });
  });
};

module.exports = { createServer };

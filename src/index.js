/* eslint-disable no-console */
'use strict';
import 'dotenv/config'; // Оставляем первой строкой!
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'node:events';

import { sequelize } from './utils/db.js';
import { Room } from './modules/Room.js';
import { Message } from './modules/Message.js';
import { User } from './modules/User.js';
import { UserRooms } from './modules/UserRooms.js';

import { messageRouter } from './routers/messageRouter.js';
import { roomRouter } from './routers/roomRouter.js';
import { userRouter } from './routers/userRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(messageRouter);
app.use(roomRouter);
app.use(userRouter);

Room.hasMany(Message, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
  as: 'messages',
});
Message.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId' });

Room.belongsToMany(User, { through: UserRooms, foreignKey: 'roomId' });
User.belongsToMany(Room, { through: UserRooms, foreignKey: 'userId' });

UserRooms.belongsTo(User, { foreignKey: 'userId' });
UserRooms.belongsTo(Room, { foreignKey: 'roomId' });

const startApp = async () => {
  try {
    await sequelize.sync();

    const server = app.listen(PORT);

    const wss = new WebSocketServer({ server });
    const messageEmitter = new EventEmitter();

    messageEmitter.on('message', (data) => {
      if (data.roomId) {
        for (const client of wss.clients) {
          if (client.roomId === data.roomId) {
            client.send(JSON.stringify(data));
          }
        }

        return;
      }

      for (const client of wss.clients) {
        if (!client.roomId) {
          client.send(JSON.stringify(data));
        }
      }
    });

    wss.on('connection', (client) => {
      console.log('A new client connected');

      client.on('message', (rawData) => {
        const data = JSON.parse(rawData.toString());

        if (data.type === 'JOIN_ROOM') {
          client.roomId = data.roomId;
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};

startApp();

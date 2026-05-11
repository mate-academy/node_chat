'use strict';
import 'dotenv/config';
import cors from 'cors';

import express from "express";
import http from 'http';
import { Server } from "socket.io";
import { Client } from 'pg';

import { sequelize } from "./db/connection.js";
import { handleChatConnection } from './sockets/chat.handler.js';

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, { cors: { origin: '*' } });

const createDatabaseIfNeeded = async () => {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: 'postgres',
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'chat_db';

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

    if (res.rowCount === 0) {
      console.log(`База даних "${dbName}" не знайдена. Створюємо...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`База даних "${dbName}" успішно створена!`);
    } else {
      console.log(`База даних "${dbName}" вже існує.`);
    }
  } catch (error) {
    console.error('Помилка при перевірці/створенні БД:', error);
  } finally {
    await client.end();
  }
};

io.on('connection', async (socket) => {
  await handleChatConnection(io, socket);
});

const start = async () => {
  try {
    await createDatabaseIfNeeded();

    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('DB has been connected to');

    await sequelize.sync({ force: true });
    // eslint-disable-next-line no-console
    console.log('Models have been created');

    httpServer.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on ${PORT}`);
    });

  } catch (error) {
    console.error('Помилка при запуску сервера:', error);
  }
}

start();

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { sequelize, Room, Message } from './models/index.js';

const PORT = process.env.PORT || 3001;

export const createServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const roomCount = await Room.count();

    if (roomCount === 0) {
      await Room.create({ name: 'General' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect or sync database:', error);
  }

  const app = express();

  app.use(express.json());
  app.use(cors());

  // activeRooms: Map<roomId, Set<ws>>
  const activeRooms = new Map();

  const getRoomsList = async () => {
    const dbRooms = await Room.findAll({
      include: [
        {
          model: Message,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return dbRooms.map((room) => ({
      id: room.id,
      name: room.name,
      messageCount: room.Messages ? room.Messages.length : 0,
    }));
  };

  const broadcastToRoom = (roomId, payload) => {
    const clients = activeRooms.get(roomId);

    if (!clients) {
      return;
    }

    const data = JSON.stringify(payload);

    clients.forEach((client) => {
      if (client.readyState === 1 /* OPEN */) {
        client.send(data);
      }
    });
  };

  const broadcastToAll = (wssInstance, payload) => {
    const data = JSON.stringify(payload);

    wssInstance.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  };

  app.use('{*path}', (req, res) => {
    res.status(404).send('Not Found');
  });

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);

    if (res.headersSent) {
      return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    res.status(statusCode).send(message);
  });

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.username = null;
    ws.currentRoomId = null;

    ws.on('message', async (raw) => {
      let payload;

      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const { type } = payload;

      switch (type) {
        // ─── Username ───────────────────────────────────────────────────
        case 'set_username': {
          ws.username =
            String(payload.username).trim().slice(0, 32) || 'Anonymous';

          const roomsList = await getRoomsList();

          ws.send(
            JSON.stringify({
              type: 'rooms_list',
              rooms: roomsList,
            }),
          );
          break;
        }

        // ─── Create Room ────────────────────────────────────────────────
        case 'create_room': {
          const roomName = String(payload.name || 'New Room')
            .trim()
            .slice(0, 64);

          await Room.create({ name: roomName });

          const roomsList = await getRoomsList();

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: roomsList,
          });
          break;
        }

        // ─── Join Room ──────────────────────────────────────────────────
        case 'join_room': {
          const { roomId } = payload;

          if (ws.currentRoomId) {
            const prevClients = activeRooms.get(ws.currentRoomId);

            if (prevClients) {
              prevClients.delete(ws);
            }
          }

          const room = await Room.findByPk(roomId);

          if (!room) {
            ws.send(
              JSON.stringify({ type: 'error', message: 'Room not found' }),
            );
            break;
          }

          if (!activeRooms.has(roomId)) {
            activeRooms.set(roomId, new Set());
          }

          activeRooms.get(roomId).add(ws);
          ws.currentRoomId = roomId;

          const messages = await Message.findAll({
            where: { roomId },
            order: [['createdAt', 'ASC']],
          });

          ws.send(
            JSON.stringify({
              type: 'history',
              roomId,
              messages: messages.map((m) => ({
                id: m.id,
                author: m.author,
                text: m.text,
                createdAt: m.createdAt,
              })),
            }),
          );
          break;
        }

        // ─── Rename Room ─────────────────────────────────────────────────
        case 'rename_room': {
          const room = await Room.findByPk(payload.roomId);

          if (!room) {
            break;
          }

          const newName = String(payload.name || room.name)
            .trim()
            .slice(0, 64);

          await room.update({ name: newName });

          const roomsList = await getRoomsList();

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: roomsList,
          });
          break;
        }

        // ─── Delete Room ─────────────────────────────────────────────────
        case 'delete_room': {
          const room = await Room.findByPk(payload.roomId);

          if (!room) {
            break;
          }

          broadcastToRoom(payload.roomId, {
            type: 'room_deleted',
            roomId: payload.roomId,
          });

          const clientsInRoom = activeRooms.get(payload.roomId);

          if (clientsInRoom) {
            clientsInRoom.forEach((client) => {
              client.currentRoomId = null;
            });
            activeRooms.delete(payload.roomId);
          }

          await room.destroy();

          const roomsList = await getRoomsList();

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: roomsList,
          });
          break;
        }

        // ─── Chat Message ─────────────────────────────────────────────────
        case 'chat_message': {
          if (!ws.currentRoomId) {
            ws.send(
              JSON.stringify({ type: 'error', message: 'Join a room first' }),
            );
            break;
          }

          const text = String(payload.text || '').trim();

          if (!text) {
            break;
          }

          const messageRecord = await Message.create({
            roomId: ws.currentRoomId,
            author: ws.username || 'Anonymous',
            text,
          });

          const messagePayload = {
            id: messageRecord.id,
            author: messageRecord.author,
            text: messageRecord.text,
            createdAt: messageRecord.createdAt,
          };

          broadcastToRoom(ws.currentRoomId, {
            type: 'chat_message',
            roomId: ws.currentRoomId,
            message: messagePayload,
          });
          break;
        }

        default:
          break;
      }
    });

    ws.on('close', () => {
      if (ws.currentRoomId) {
        const clientsInRoom = activeRooms.get(ws.currentRoomId);

        if (clientsInRoom) {
          clientsInRoom.delete(ws);
        }
      }
    });
  });
};

import { WebSocketServer } from 'ws';
import { Message, User, Room } from '../models/index.js';

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  const clients = new Map();

  wss.on('connection', (ws) => {
    ws.on('message', async (rawData) => {
      try {
        const data = JSON.parse(rawData);

        if (data.type === 'join-room') {
          const { userId, roomId } = data;

          const user = await User.findByPk(userId);
          const room = await Room.findByPk(roomId);

          if (!user || !room) {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'User or room not found',
              }),
            );

            return;
          }

          const isMember = await room.hasUser(user);

          if (!isMember) {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'User is not a member of this room',
              }),
            );

            return;
          }

          clients.set(ws, roomId);

          ws.send(
            JSON.stringify({
              type: 'joined-room',
              roomId,
            }),
          );

          return;
        }

        if (data.type !== 'message') {
          return;
        }

        const currentRoomId = clients.get(ws);

        if (currentRoomId !== data.roomId) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'You are not in this room',
            }),
          );

          return;
        }

        const message = await Message.create({
          userId: data.userId,
          roomId: data.roomId,
          author: data.author,
          text: data.text,
        });

        const fullMessage = await Message.findByPk(message.id, {
          include: [
            {
              model: User,
              attributes: ['id', 'username'],
            },
            {
              model: Room,
              attributes: ['id', 'username'],
            },
          ],
        });

        const messageData = JSON.stringify({
          type: 'message',
          message: fullMessage,
        });

        for (const [client, roomId] of clients) {
          if (roomId === data.roomId && client.readyState === WebSocket.OPEN) {
            client.send(messageData);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return wss;
};

export default setupWebSocket;

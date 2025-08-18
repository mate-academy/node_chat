import { WebSocket, WebSocketServer } from 'ws';
import { messagesApi } from './api/messagesApi.js';

const clients = new Map();

export const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'join') {
          const roomId = data.roomId;

          clients.set(ws, roomId);

          const history = await messagesApi.getAllMessages(roomId);

          ws.send(
            JSON.stringify({
              type: 'history',
              payload: history,
            }),
          );
        }

        if (data.type === 'message') {
          const { roomId, message } = data;
          const id = crypto.randomUUID();
          const newMessage = {
            ...message,
            id,
          };

          messagesApi.saveMessageToJson(newMessage);

          wss.clients.forEach((client) => {
            if (
              client.readyState === WebSocket.OPEN &&
              clients.get(client) === roomId
            ) {
              client.send(
                JSON.stringify({
                  type: 'new-message',
                  payload: newMessage,
                }),
              );
            }
          });
        }
      } catch (error) {
        throw error;
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });
};

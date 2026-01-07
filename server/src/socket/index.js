import { chatMembersCount, handleChat } from './chat.handler.js';

export const initWebSocket = (wss) => {
  wss.on('connection', (ws) => {
    ws.on('message', (rawData) => {
      try {
        const message = JSON.parse(rawData);

        handleChat(ws, wss, message);
      } catch (error) {
        console.error('Parsing error');
      }
    });

    ws.on('close', () => {
      console.log('User disconnected');
      if (ws.roomId) {
        chatMembersCount(wss, ws.roomId);
      }
    });
  });
};

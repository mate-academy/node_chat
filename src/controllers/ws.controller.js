import { WebSocket } from 'ws';
import { roomUsers } from '../utils/roomUsers.js';
import { messageController } from './message.controller.js';
import { roomController } from './room.controller.js';

const broadcastMessage = (data, ws, roomName, wss) => {
  wss.clients.forEach((client) => {
    if (
      client !== ws &&
      client.roomName === roomName &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(data);
    }
  });
};

const handleWebSocketMessage = async (ws, data, wss) => {
  const messageData = JSON.parse(data);
  const { roomId, userName, message } = messageData;
  const roomName = await roomController.getRoomById(roomId);

  try {
    switch (messageData.type) {
      case 'newMessage':
        const newMessageResponse =
          await messageController.createMessageByRoomId(
            roomId,
            userName,
            message,
          );

        broadcastMessage(JSON.stringify(newMessageResponse), ws, roomName, wss);

        ws.send(JSON.stringify(newMessageResponse));
        break;

      case 'joinRoom':
        ws.userName = userName;

        ws.roomName = roomName;
        roomUsers.userJoin(userName, roomName);

        const users = roomUsers.getRoomUsers(roomName);
        const previousMessages =
          await messageController.getAllMessagesByRoomID(roomId);
        const adminGriting = {
          message: 'Ok',
          data: {
            id: '0',
            userName: 'admin',
            text: `Welcome ${userName}`,
            time: new Date().toISOString(),
            roomName: roomName,
            roomUsers: users,
          },
        };

        previousMessages.push(adminGriting);

        previousMessages.forEach((msg) => {
          ws.send(JSON.stringify(msg));
        });

        broadcastMessage(
          JSON.stringify({
            message: 'Ok',
            data: {
              id: '0',
              userName: 'admin',
              text: `${userName} has joined`,
              time: new Date().toISOString(),
              roomName: roomName,
              roomUsers: users,
            },
          }),
          ws,
          roomName,
          wss,
        );
        break;

      default:
        throw new Error('Unknown message type:', messageData.type);
    }
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
  }
};

export const wsController = {
  broadcastMessage,
  handleWebSocketMessage,
};

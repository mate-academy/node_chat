import { WebSocket } from 'ws';
import { rooms, users } from '../data/chatData.js';
import { send } from '../utils/send.js';

export function handleMessage(ws, msg, wss) {
  const data = JSON.parse(msg);

  switch (data.type) {
    case 'SET_USERNAME':
      ws.username = data.username;
      users.push({ id: Date.now(), username: data.username, roomId: null });
      send(ws, { type: 'WELCOME', message: `Welcome ${data.username}!` });
      break;

    case 'JOIN_ROOM': {
      const roomId = Number(data.roomId);

      ws.roomId = roomId;

      const currentRoom = rooms.find((r) => r.id === roomId);

      if (!currentRoom) {
        send(ws, { type: 'ERROR', message: 'Room not found' });

        return;
      }

      send(ws, {
        type: 'ROOM_HISTORY',
        room: currentRoom.name,
        messages: currentRoom.messages,
      });

      broadcast(
        wss,
        {
          type: 'INFO',
          message: `${ws.username} joined ${currentRoom.name}`,
        },
        roomId,
      );

      break;
    }

    case 'SEND_MESSAGE': {
      const currentRoom = rooms.find((r) => r.id === ws.roomId);

      if (!currentRoom) {
        return;
      }

      const message = {
        author: ws.username,
        text: data.text,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      currentRoom.messages.push(message);

      broadcast(wss, { type: 'NEW_MESSAGE', message }, ws.roomId);
      break;
    }

    default:
  }
}

function broadcast(wss, data, roomId) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(JSON.stringify(data));
    }
  });
}

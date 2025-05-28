const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const rooms = new Map();
const clients = new Map();

function socketHandler(ws) {
  ws.id = uuidv4();

  ws.on('message', (messageData) => {
    try {
      const data = JSON.parse(messageData);

      switch (data.type) {
        case 'set_username':
          clients.set(ws, { username: data.username, room: null });
          break;

        case 'create_room':
          if (!rooms.has(data.room)) {
            rooms.set(data.room, []);
            sendToAll({ type: 'rooms_list', rooms: [...rooms.keys()] });
          }
          break;

        case 'join_room':
          if (rooms.has(data.room)) {
            const userData = clients.get(ws);

            userData.room = data.room;
            clients.set(ws, userData);

            ws.send(
              JSON.stringify({
                type: 'room_history',
                messages: rooms.get(data.room),
              }),
            );
          }
          break;

        case 'send_message':
          const user = clients.get(ws);

          if (!user || !user.room) {
            return;
          }

          const msg = {
            id: uuidv4(),
            author: user.username,
            time: new Date().toISOString(),
            text: data.text,
          };

          rooms.get(user.room).push(msg);
          broadcastToRoom(user.room, { type: 'new_message', message: msg });
          break;

        case 'delete_room':
          if (rooms.has(data.room)) {
            rooms.delete(data.room);
            sendToAll({ type: 'rooms_list', rooms: [...rooms.keys()] });
          }
          break;

        case 'rename_room':
          if (rooms.has(data.oldRoom) && !rooms.has(data.newRoom)) {
            const messages = rooms.get(data.oldRoom);

            rooms.delete(data.oldRoom);
            rooms.set(data.newRoom, messages);

            clients.forEach((client) => {
              if (client.room === data.oldRoom) {
                client.room = data.newRoom;
              }
            });
            sendToAll({ type: 'rooms_list', rooms: [...rooms.keys()] });
          }
          break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.send(JSON.stringify({ type: 'rooms_list', rooms: [...rooms.keys()] }));
}

function sendToAll(data) {
  for (const client of clients.keys()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

function broadcastToRoom(room, data) {
  for (const [client, info] of clients.entries()) {
    if (info.room === room && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

module.exports = socketHandler;

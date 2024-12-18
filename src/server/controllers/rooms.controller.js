const { v4: uuidv4 } = require('uuid');

const rooms = {};

const create = (ws, data) => {
  const room = rooms[data.room];

  if (room) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room already exist' }));

    return;
  }

  const newRoom = {
    users: [{ ws, username: data.username }],
    messages: [],
  };

  rooms[data.room] = newRoom;

  ws.send(
    JSON.stringify({
      type: 'created',
      room: data.room,
      username: data.username,
    }),
  );
};

const join = (ws, data) => {
  const room = rooms[data.room];

  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));

    return;
  }

  room.users.push({ ws, username: data.username });

  ws.send(
    JSON.stringify({
      type: 'joined',
      room: data.room,
      username: data.username,
      messages: room.messages,
    }),
  );
};

const rename = (ws, data) => {
  const { room, newRoomName } = data;
  const currentRoom = rooms[room];

  if (!room || !currentRoom) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));

    return;
  }

  if (!newRoomName) {
    ws.send(
      JSON.stringify({ type: 'error', message: 'New room name is required' }),
    );

    return;
  }

  const { users } = currentRoom;

  rooms[newRoomName] = currentRoom;
  delete rooms[room];

  users.forEach((user) => {
    user.ws.send(
      JSON.stringify({
        type: 'renamed',
        room: newRoomName,
        message: `Room ${room} was renamed to ${newRoomName}`,
      }),
    );
  });
};

const remove = (ws, data) => {
  const room = rooms[data.room];

  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));

    return;
  }

  const users = room.users;

  delete rooms[data.room];

  users.forEach((user) => {
    user.ws.send(
      JSON.stringify({
        type: 'removed',
        message: `Room ${data.room} was deleted`,
      }),
    );
  });
};

const sendMessage = (ws, data) => {
  const room = rooms[data.room];

  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));

    return;
  }

  const sender = room.users.find((user) => user.ws === ws);

  const newMessage = {
    createdAt: Date.now(),
    username: sender.username,
    text: data.message,
    id: uuidv4(),
  };

  room.messages.push(newMessage);

  const jsonMessage = JSON.stringify({
    type: 'message',
    message: newMessage,
  });

  for (const user of room.users) {
    user.ws.send(jsonMessage);
  }
};

const onUserDisconnect = (ws) => {
  Object.keys(rooms).forEach((roomName) => {
    const currentRoom = rooms[roomName];

    currentRoom.users = currentRoom.users.filter((user) => user.ws !== ws);

    if (!currentRoom.users.length) {
      delete rooms[roomName];
    }
  });
};

module.exports = {
  onUserDisconnect,
  create,
  join,
  sendMessage,
  rename,
  remove,
};

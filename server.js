const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3000;

const rooms = [
  {
    id: 'general',
    name: 'General',
  },
];

const messages = [];

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function broadcastRooms() {
  io.emit('rooms:list', rooms);
}

function getRoomMessages(roomId) {
  return messages.filter((message) => message.roomId === roomId);
}

io.on('connection', (socket) => {
  socket.on('user:set', ({ username }) => {
    socket.username = username;
  });

  socket.on('rooms:get', () => {
    socket.emit('rooms:list', rooms);
  });

  socket.on('room:create', ({ name }) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const existingRoom = rooms.find(
      (room) => room.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingRoom) {
      socket.emit('error:message', {
        message: 'Room with this name already exists',
      });

      return;
    }

    const newRoom = {
      id: Date.now().toString(),
      name: trimmedName,
    };

    rooms.push(newRoom);
    broadcastRooms();
  });

  socket.on('room:rename', ({ roomId, name }) => {
    const trimmedName = name.trim();
    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      socket.emit('error:message', { message: 'Room not found' });

      return;
    }

    if (!trimmedName) {
      socket.emit('error:message', { message: 'Room name cannot be empty' });

      return;
    }

    const existingRoom = rooms.find(
      (item) =>
        item.id !== roomId &&
        item.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingRoom) {
      socket.emit('error:message', {
        message: 'Room with this name already exists',
      });

      return;
    }

    room.name = trimmedName;
    broadcastRooms();
  });

  socket.on('room:delete', async ({ roomId }) => {
    if (roomId === 'general') {
      socket.emit('error:message', {
        message: 'General room cannot be deleted',
      });

      return;
    }

    const roomIndex = rooms.findIndex((room) => room.id === roomId);

    if (roomIndex === -1) {
      socket.emit('error:message', { message: 'Room not found' });

      return;
    }

    rooms.splice(roomIndex, 1);

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].roomId === roomId) {
        messages.splice(index, 1);
      }
    }

    const deletedRoomSockets = await io.in(roomId).fetchSockets();

    for (const currentSocket of deletedRoomSockets) {
      currentSocket.leave(roomId);
      currentSocket.join('general');
      currentSocket.currentRoomId = 'general';

      currentSocket.emit('room:joined', { roomId: 'general' });

      currentSocket.emit('room:history', {
        roomId: 'general',
        messages: getRoomMessages('general'),
      });
    }

    broadcastRooms();
  });

  socket.on('room:join', ({ roomId }) => {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      socket.emit('error:message', { message: 'Room not found' });

      return;
    }

    if (socket.currentRoomId) {
      socket.leave(socket.currentRoomId);
    }

    socket.join(roomId);
    socket.currentRoomId = roomId;

    socket.emit('room:joined', { roomId });

    socket.emit('room:history', {
      roomId,
      messages: getRoomMessages(roomId),
    });
  });

  socket.on('message:send', ({ roomId, author, text }) => {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      socket.emit('error:message', { message: 'Room not found' });

      return;
    }

    if (!author || !text) {
      return;
    }

    const message = {
      id: Date.now().toString(),
      roomId,
      author,
      text,
      time: getCurrentTime(),
    };

    messages.push(message);

    io.to(roomId).emit('message:new', {
      roomId,
      message,
    });
  });

  socket.on('disconnect', () => {});
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
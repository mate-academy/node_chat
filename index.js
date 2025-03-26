import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const ADMIN = 'Admin';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const expressServer = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const UsersState = {
  users: [],
  rooms: new Set(),

  setUsers(newUsersArray) {
    this.users = newUsersArray;
  },

  addRoom(room) {
    this.rooms.add(room);
  },

  removeRoom(room) {
    if (![...this.users].some(user => user.room === room)) {
      this.rooms.delete(room);
    }
  }
};

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  },
});

io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.emit('roomList', { rooms: [...UsersState.rooms] });

  socket.on('enterRoom', ({ name, room }) => {
    UsersState.addRoom(room);
    const prevRoom = getUser(socket.id)?.room;

    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`));
    }

    const user = activateUser(socket.id, name, room);
    socket.join(user.room);

    socket.emit('message', buildMsg(ADMIN, `You joined ${user.room}`));
    socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} joined the room`));

    io.to(user.room).emit('userList', { users: getUsersInRoom(user.room) });
    updateRoomList();
  });

  socket.on('renameRoom', ({ oldRoom, newRoom }) => {
    UsersState.addRoom(newRoom);
    UsersState.removeRoom(oldRoom);

    UsersState.users.forEach((user) => {
      if (user.room === oldRoom) user.room = newRoom;
    });

    io.emit('message', buildMsg(ADMIN, `Room "${oldRoom}" was renamed to "${newRoom}"`));
    updateRoomList();
  });

  socket.on('deleteRoom', ({ room }) => {
    if (!getUsersInRoom(room).length) {
      UsersState.removeRoom(room);
      io.emit('message', buildMsg(ADMIN, `Room "${room}" has been deleted`));
      updateRoomList();
    }
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    userLeavesApp(socket.id);

    if (user) {
      io.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has left the room`));
    }

    updateRoomList();
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on('message', ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) io.to(room).emit('message', buildMsg(name, text, Date.now()));
  });
});

function buildMsg(name, text, time = Date.now()) {
  return { name, text, time };
}

function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function updateRoomList() {
  io.emit('roomList', { rooms: [...UsersState.rooms] });
}

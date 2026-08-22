import { messages, rooms, socketIds, users } from '../storage/storage.js';
import { sendMessageToRoom } from '../utils/sendMessage.js';

export const setupChatHandlers = (io, socket) => {
  socket.on('JoinToNetwork', ({ username }) => {
    if (username) {
      users.set(socket.id, username);
      socketIds.set(username, socket.id);
      io.emit('UserConnectedToNetwork', username);
    }
  });

  socket.on('RequestToRoom', ({ targetUsername, room }) => {
    const inviterUsername = users.get(socket.id);
    const targetId = socketIds.get(targetUsername);

    if (!inviterUsername || !targetId || !rooms.has(room)) {
      return;
    }

    io.to(targetId).emit('RoomInviteReceived', {
      from: inviterUsername,
      room,
    });
  });

  socket.on('GetMyRooms', () => {
    if (!users.has(socket.id)) {
      return;
    }

    const myRooms = Array.from(socket.rooms).filter(
      (room) => room !== socket.id,
    );

    socket.emit('MyRoomsList', myRooms);
  });

  socket.on('GetRoomHistory', ({ room }) => {
    if (!users.has(socket.id) || !rooms.has(room) || !socket.rooms.has(room)) {
      return;
    }

    socket.emit('RoomHistory', { room, history: messages[room] });
  });

  socket.on('JoinToRoom', ({ room }) => {
    if (!users.has(socket.id)) {
      return;
    }

    if (!rooms.has(room)) {
      rooms.add(room);
      messages[room] = [];
    }

    socket.join(room);

    const username = users.get(socket.id);

    const { text, date, isSystem } = sendMessageToRoom(
      'Server',
      `User ${username} has joined to chat`,
      room,
      true,
    );

    socket.to(room).emit('UserConnectedToRoom', {
      username,
      room,
      text,
      date,
      isSystem,
    });
  });

  socket.on('DeleteRoom', ({ room }) => {
    if (!users.has(socket.id) || !rooms.has(room)) {
      return;
    }

    const username = users.get(socket.id);

    io.to(room).emit('UserDeleteRoom', { username, room });

    rooms.delete(room);
    delete messages[room];

    io.in(room).socketsLeave(room);
  });

  socket.on('RenameRoom', ({ room, newRoom }) => {
    if (!users.has(socket.id) || !rooms.has(room)) {
      return;
    }

    rooms.delete(room);
    rooms.add(newRoom);
    messages[newRoom] = messages[room] || [];
    delete messages[room];

    const username = users.get(socket.id);

    io.to(room).emit('UserRenameRoom', { username, room, newRoom });

    io.in(room).socketsJoin(newRoom);
    io.in(room).socketsLeave(room);
  });

  socket.on('SendMessage', ({ room, text }) => {
    if (!users.has(socket.id) || !rooms.has(room)) {
      return;
    }

    const username = users.get(socket.id);

    const { date, isSystem } = sendMessageToRoom(username, text, room);

    io.to(room).emit('NewMessage', {
      username,
      room,
      text,
      date,
      isSystem,
    });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);

    socketIds.delete(username);
    users.delete(socket.id);
  });
};

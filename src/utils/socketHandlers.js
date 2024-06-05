import roomService from '../services/room.service.js';
import userService from '../services/user.service.js';
import { io } from '../index.js';
import messageService from '../services/message.service.js';

export const onNewUser = async (username, socket) => {
  const user = await userService.getByName(username);

  if (!user) {
    await userService.create(username);
    socket.emit('user_set', username);
  }
};

export const onCreateRoom = async (name) => {
  const room = await roomService.getByName(name);

  if (!room) {
    await roomService.create(name);
    io.emit('room_created', name);
  }
};

export const onJoinRoom = async (name, socket) => {
  const room = await roomService.getByName(name);

  if (room) {
    const user = await userService.getByName(socket.handshake.query.username);

    await room.addChatuser(user);
    socket.join(name);

    const messages = await messageService.getAll(room.id);

    socket.emit('room_joined', {
      messages: messages.map((msg) => ({
        author: msg.chatuser.username,
        text: msg.text,
        time: msg.createdAt,
      })),
    });
  }
};

export const onRenameRoom = async ({ prevName, newName }) => {
  const room = await roomService.getByName(prevName);

  if (room) {
    room.name = newName;
    await room.save();
    io.emit('room_renamed', { prevName, newName });
  }
};

export const onDeleteRoom = async (name) => {
  const room = await roomService.getByName(name);

  if (room) {
    await room.destroy();
    io.emit('room_deleted', name);
  }
};

export const onSendMessage = async ({ roomName, message }, socket) => {
  const room = await roomService.getByName(roomName);

  if (room) {
    const user = await userService.getByName(socket.handshake.query.username);
    const newMessage = await messageService.create({
      message,
      roomId: room.id,
      userId: user.id,
    });

    io.to(roomName).emit('new_message', {
      author: user.username,
      text: newMessage.text,
      time: newMessage.createdAt,
    });
  }
};

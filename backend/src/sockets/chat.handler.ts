import { Server, Socket } from 'socket.io';
import { roomService } from '../services/room.service.js';
import { messageService } from '../services/message.service.js';

export const handleChatConnection = async (io: Server, socket: Socket) => {
  console.log(`User connected ${socket.id}`);

  let rooms = await roomService.getAllRooms();

  socket.emit('roomsList', rooms);

  socket.on('createRoom', async (data: { roomName: string, owner: string }) => {
    try {
      if (
        !data.roomName ||
        (typeof data.roomName !== 'string') ||
        !data.roomName.trim()
      ) {
        socket.emit('error', 'Room name must be a string');
        return;
      }

      await roomService.createRoom(data.roomName, data.owner);
      rooms = await roomService.getAllRooms();

      io.emit('roomsList', rooms);
    } catch(error) {
      console.error('Room creation error:', error);
      socket.emit('error', 'Room creation error');
    }
  });

  socket.on('joinRoom', async (roomId) => {
    try {
      socket.join(roomId as string);

      const messagesFromRoom =
        await messageService.getMessagesByRoomId(roomId);

      socket.emit('roomMessages', messagesFromRoom);
    } catch (error) {
      console.error('Room joining error:', error);
      socket.emit('error', 'Room joining error');
    }

  });

  socket.on('sendMessage', async (messageObj) => {
    try {
      if (
        !messageObj ||
        !messageObj.text ||
        !messageObj.roomId ||
        typeof messageObj.roomId !== 'number' ||
        !messageObj.author
      ) {
        socket.emit(
          'error',
          'Message object must have next fields: text, roomId, author'
        );
        return;
      }
      const newMessage =
        await messageService.createMessage(messageObj);

      io.to(messageObj.roomId as string).emit('newMessage', newMessage);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', 'Send message error');
    }

  });

  socket.on('deleteRoom', async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);

      rooms = await roomService.getAllRooms();

      io.emit('roomsList', rooms);
    } catch (error) {
      console.error('Deleting room error:', error);
      socket.emit('error', 'Deleting room error');
    }

  });

  socket.on('renameRoom', async (data) => {
    try {
      if (!data || !data.roomId || !data.newName) {
        return socket.emit('error', 'Invalid data for renaming room');
      }

      await roomService.renameRoom(data);

      rooms = await roomService.getAllRooms();

      io.emit('roomsList', rooms);
    } catch (error) {
      console.error('Renaming room error:', error);
      socket.emit('error', 'Renaming room error');
    }
  });
}

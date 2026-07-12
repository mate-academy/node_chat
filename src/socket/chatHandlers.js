import { EVENTS } from '../constants/events.js';
import * as roomsStore from '../rooms/roomsStore.js';
import { createMessage } from '../utils/createMessage.js';

// Додали третій аргумент activeUsers
export function registerChatHandlers(io, socket, activeUsers) {
  socket.on(EVENTS.ROOM_CREATE, (roomName) => {
    const trimmedName = roomName?.trim();

    if (!trimmedName) {
      return;
    }
    roomsStore.createRoom(trimmedName);
    io.emit(EVENTS.ROOMS_UPDATE, roomsStore.getAllRooms());
  });

  socket.on(EVENTS.ROOM_RENAME, ({ roomId, newName }) => {
    const trimmedName = newName?.trim();

    if (!trimmedName) {
      return;
    }

    const isRenamed = roomsStore.renameRoom(roomId, trimmedName);

    if (isRenamed) {
      io.emit(EVENTS.ROOMS_UPDATE, roomsStore.getAllRooms());
    }
  });

  socket.on(EVENTS.ROOM_DELETE, (roomId) => {
    const isDeleted = roomsStore.deleteRoom(roomId);

    if (isDeleted) {
      io.emit(EVENTS.ROOMS_UPDATE, roomsStore.getAllRooms());
    }
  });

  socket.on(EVENTS.ROOM_JOIN, (roomId) => {
    socket.rooms.forEach((roomToLeave) => {
      if (roomToLeave !== socket.id) {
        socket.leave(roomToLeave);
      }
    });

    socket.join(roomId);

    const roomData = roomsStore.getRoomById(roomId);

    if (roomData) {
      // ЗМІНЕНО: Тепер ми відправляємо і ID кімнати, і самі повідомлення
      socket.emit(EVENTS.ROOM_HISTORY, {
        roomId,
        messages: roomData.messages,
      });
    }
  });

  // -----------------------------------------
  // НОВЕ: Обробник повідомлень
  // -----------------------------------------
  socket.on(EVENTS.MESSAGE_SEND, ({ roomId, text }) => {
    const trimmedText = text?.trim();

    if (!trimmedText) {
      return;
    }

    // Дістаємо ім'я користувача за його socket.id
    const username = activeUsers.get(socket.id) || 'Анонім';

    // Створюємо повідомлення через фабрику
    const message = createMessage(username, trimmedText);

    const room = roomsStore.getRoomById(roomId);

    if (room) {
      // 1. Зберігаємо в історію
      room.messages.push(message);

      // 2. Розсилаємо всім користувачам у цій кімнаті
      io.to(roomId).emit(EVENTS.MESSAGE_NEW, message);
    }
  });
}

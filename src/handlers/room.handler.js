import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { broadcast } from '../utils/broadcast.js';
import { send } from '../utils/send.js';

function broadcastRooms(wss) {
  broadcast(wss, {
    type: 'rooms',
    rooms: roomService.getAll(),
  });
}

function createRoom(wss, ws, data) {
  const name = data.name?.trim();

  if (!name) {
    send(ws, { type: 'error', message: 'Name is required' });

    return;
  }

  roomService.create(name);
  broadcastRooms(wss);
}

function renameRoom(wss, ws, data) {
  const name = data.name?.trim();

  if (!name) {
    send(ws, { type: 'error', message: 'Name is required' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  const room = roomService.rename(data.roomId, name);

  if (!room) {
    send(ws, { type: 'error', message: 'Room not found' });

    // eslint-disable-next-line no-useless-return
    return;
  }
  broadcastRooms(wss);
}

function deleteRoom(wss, ws, data) {
  const isRemoved = roomService.remove(data.roomId);

  if (isRemoved === false) {
    send(ws, { type: 'error', message: 'Room not found' });

    // eslint-disable-next-line no-useless-return
    return;
  }
  messageService.removeByRoom(data.roomId);

  broadcast(
    wss,
    { type: 'roomDeleted', roomId: data.roomId },
    (client) => client.roomId === data.roomId,
  );

  wss.clients.forEach((client) => {
    if (client.roomId === data.roomId) {
      client.roomId = null;
    }
  });
  broadcastRooms(wss);
}

export const roomHandler = {
  createRoom,
  renameRoom,
  deleteRoom,
};

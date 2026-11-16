import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { broadcast } from '../utils/broadcast.js';
import { send } from '../utils/send.js';

function join(ws, data) {
  const room = roomService.getById(data.roomId);

  if (!room) {
    send(ws, { type: 'error', message: 'Room not found' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  ws.roomId = data.roomId;

  send(ws, {
    type: 'history',
    roomId: data.roomId,
    messages: messageService.getByRoom(data.roomId),
  });
}

function sendMessage(wss, ws, data) {
  const room = roomService.getById(ws.roomId);

  if (!room) {
    send(ws, { type: 'error', message: 'Join a room first' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  const author = data.author?.trim();
  const text = data.text?.trim();

  if (!author || !text) {
    send(ws, { type: 'error', message: 'Author and text is required' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  const message = messageService.add({
    roomId: ws.roomId,
    author: author,
    text: text,
  });

  broadcast(
    wss,
    { type: 'message', message: message },
    (client) => client.roomId === ws.roomId,
  );
}

export const chatHandler = {
  join,
  sendMessage,
};

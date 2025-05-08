import { messageEmitter } from '../emitters/message.emitter';
import { roomManager } from './room.manager';

export function addListeners() {
  messageEmitter.on('message', ({ roomId, preview }) => {
    roomManager.broadcast(roomId, {
      type: 'message',
      payload: preview,
    });
  });

  messageEmitter.on('leave', ({ roomId, userId }) => {
    const ws = roomManager.getSocket(roomId, userId);
    ws?.close(4001, 'You have left the room');
  });

  messageEmitter.on('delete', ({ roomId }) => {
    roomManager.delete(roomId);
  });

  messageEmitter.on('changeName', ({ roomId, newName }) => {
    roomManager.broadcast(roomId, {
      type: 'name_changed',
      payload: newName,
    });
  });
}

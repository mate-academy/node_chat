import { catchSocketError } from './catchSocketError.js';
import {
  onCreateRoom,
  onNewUser,
  onJoinRoom,
  onRenameRoom,
  onDeleteRoom,
  onSendMessage,
} from './socketHandlers.js';

export const handleConnection = (socket) => {
  // eslint-disable-next-line no-console
  console.log('New client connected');

  socket.on('new_user', catchSocketError(onNewUser, socket));
  socket.on('create_room', catchSocketError(onCreateRoom));
  socket.on('join_room', catchSocketError(onJoinRoom, socket));
  socket.on('rename_room', catchSocketError(onRenameRoom));
  socket.on('delete_room', catchSocketError(onDeleteRoom));
  socket.on('send_message', catchSocketError(onSendMessage, socket));
};

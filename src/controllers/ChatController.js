'use strict';

const { ChatError } = require('../services/ChatService');

class ChatController {
  constructor(chatService, transport) {
    this.chatService = chatService;
    this.transport = transport;
  }

  handleRequest(client, request) {
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      this.transport.sendError(client, 'Request must be a JSON object.');

      return;
    }

    try {
      this.dispatch(client, request);
    } catch (error) {
      if (error instanceof ChatError) {
        this.transport.sendError(client, error.message);

        return;
      }

      throw error;
    }
  }

  dispatch(client, request) {
    switch (request.type) {
      case 'set_username':
        this.chatService.setUsername(client, request.username);

        return;

      case 'list_rooms':
        this.transport.send(client, {
          type: 'rooms',
          rooms: this.chatService.getRooms(),
        });

        return;

      case 'create_room': {
        const room = this.chatService.createRoom(request.name);

        this.transport.broadcast({ type: 'room_created', room });
        this.broadcastRooms();

        return;
      }

      case 'rename_room': {
        const room = this.chatService.renameRoom(request.roomId, request.name);

        this.transport.broadcast({ type: 'room_renamed', room });
        this.broadcastRooms();

        return;
      }

      case 'join_room': {
        const { room, messages } = this.chatService.joinRoom(
          client,
          request.roomId,
        );

        this.transport.send(client, {
          type: 'room_joined',
          room,
          messages,
        });

        return;
      }

      case 'delete_room': {
        const roomId = this.chatService.deleteRoom(request.roomId);

        this.transport.broadcast({ type: 'room_deleted', roomId });
        this.broadcastRooms();

        return;
      }

      case 'send_message': {
        const message = this.chatService.sendMessage(
          client,
          request.roomId,
          request.text,
        );

        this.transport.broadcastToRoom(request.roomId, {
          type: 'message',
          roomId: request.roomId,
          message,
        });

        return;
      }

      default:
        this.transport.sendError(client, 'Unknown request type.');
    }
  }

  broadcastRooms() {
    this.transport.broadcast({
      type: 'rooms',
      rooms: this.chatService.getRooms(),
    });
  }
}

module.exports = { ChatController };

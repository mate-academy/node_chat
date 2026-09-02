import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { DeleteMessageEventDto } from './dto/delete-message-event.dto';
import { EditMessageEventDto } from './dto/edit-message-event.dto';
import { JoinRoomEventDto } from './dto/join-room-event.dto';
import { SendMessageEventDto } from './dto/send-message-event.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  private server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('room:join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomEventDto,
  ) {
    try {
      await this.messagesService.ensureMembership(data.roomId, data.userId);

      const connectedUserId = client.data.userId as string | undefined;

      if (connectedUserId && connectedUserId !== data.userId) {
        throw new WsException('Socket is already connected as another user');
      }

      client.data.userId = data.userId;

      await client.join(data.roomId);

      return {
        event: 'room:joined',
        data: {
          roomId: data.roomId,
        },
      };
    } catch (error) {
      this.throwSocketError(error, 'Unable to join room');
    }
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageEventDto,
  ) {
    this.ensureJoinedUser(
      client,
      data.roomId,
      data.authorId,
      'sending messages',
    );

    try {
      const message = await this.messagesService.create(data.roomId, {
        authorId: data.authorId,
        clientMessageId: data.clientMessageId,
        text: data.text,
      });

      this.server.to(data.roomId).emit('message:created', message);

      return {
        event: 'message:sent',
        data: message,
      };
    } catch (error) {
      this.throwSocketError(error, 'Unable to send message');
    }
  }

  @SubscribeMessage('message:edit')
  async editMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: EditMessageEventDto,
  ) {
    this.ensureJoinedUser(
      client,
      data.roomId,
      data.requesterId,
      'editing messages',
    );

    try {
      const message = await this.messagesService.update(
        data.roomId,
        data.messageId,
        {
          requesterId: data.requesterId,
          text: data.text,
        },
      );

      this.server.to(data.roomId).emit('message:updated', message);

      return {
        event: 'message:edited',
        data: message,
      };
    } catch (error) {
      this.throwSocketError(error, 'Unable to edit message');
    }
  }

  @SubscribeMessage('message:delete')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: DeleteMessageEventDto,
  ) {
    this.ensureJoinedUser(
      client,
      data.roomId,
      data.requesterId,
      'deleting messages',
    );

    try {
      const deletedMessage = await this.messagesService.remove(
        data.roomId,
        data.messageId,
        data.requesterId,
      );

      this.server.to(data.roomId).emit('message:deleted', deletedMessage);

      return {
        event: 'message:removed',
        data: deletedMessage,
      };
    } catch (error) {
      this.throwSocketError(error, 'Unable to delete message');
    }
  }

  notifyRoomMembersChanged(roomId: string) {
    this.server.emit('room:members-changed', {
      roomId,
    });
  }

  private ensureJoinedUser(
    client: Socket,
    roomId: string,
    userId: string,
    action: string,
  ) {
    if (!client.rooms.has(roomId)) {
      throw new WsException(`Join the room before ${action}`);
    }

    if (client.data.userId !== userId) {
      throw new WsException(`You cannot perform this action as another user`);
    }
  }

  private throwSocketError(error: unknown, fallbackMessage: string): never {
    if (error instanceof WsException) {
      throw error;
    }

    throw new WsException(
      error instanceof Error ? error.message : fallbackMessage,
    );
  }
}

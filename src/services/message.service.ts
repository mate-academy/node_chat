import { Message } from '@prisma/client';

import { roomService } from './room.service';
import { userService } from './user.service';
import { RawMessage } from '../types/RawMessage';
import { MessagePreview } from '../types/MessagePreview';
import { NormalizedMessage } from '../types/NormalizedMessage';
import { messageRepository } from '../entity/message.repository';

import { messageEmitter } from '../emitters/message.emitter';

class MessageService {
  normalize({ id, text, createdAt }: Message): NormalizedMessage {
    return { id, text, time: createdAt };
  }

  buildMessagePreview({ author, ...message }: RawMessage): MessagePreview {
    return {
      ...this.normalize(message),
      author: userService.normalize(author),
    };
  }

  async getAll(roomId: string, userId: string): Promise<MessagePreview[]> {
    await roomService.getWithRole(roomId, userId);
    const messages = await messageRepository.getAll(roomId);

    return messages.map((rawMessage) => this.buildMessagePreview(rawMessage));
  }

  async create(
    roomId: string,
    authorId: string,
    text: string,
  ): Promise<MessagePreview> {
    await roomService.getWithRole(roomId, authorId);

    const rawMessage = await messageRepository.create(roomId, authorId, text);
    const preview = this.buildMessagePreview(rawMessage);

    messageEmitter.emit('message', { roomId, preview });

    return preview;
  }
}

export const messageService = new MessageService();

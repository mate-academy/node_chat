import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { MessageHistoryQueryDto } from './dto/message-history-query.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('rooms/:roomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() data: CreateMessageDto,
  ) {
    return this.messagesService.create(roomId, data);
  }

  @Get()
  findHistory(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: MessageHistoryQueryDto,
  ) {
    return this.messagesService.findHistory(roomId, query);
  }

  @Patch(':messageId')
  update(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() data: UpdateMessageDto,
  ) {
    return this.messagesService.update(roomId, messageId, data);
  }

  @Delete(':messageId')
  remove(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() data: DeleteMessageDto,
  ) {
    return this.messagesService.remove(roomId, messageId, data.requesterId);
  }
}

import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService, ChatGateway],
})
export class MessagesModule {}

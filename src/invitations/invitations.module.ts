import { Module } from '@nestjs/common';

import { MessagesModule } from '../messages/messages.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [PrismaModule, MessagesModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}

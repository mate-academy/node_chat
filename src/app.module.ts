import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ChatProfilesModule } from './chat-profiles/chat-profiles.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ChatProfilesModule,
    RoomsModule,
    MessagesModule,
    InvitationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

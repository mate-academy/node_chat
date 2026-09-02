import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ChatProfilesController } from './chat-profiles.controller';
import { ChatProfilesService } from './chat-profiles.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatProfilesController],
  providers: [ChatProfilesService],
})
export class ChatProfilesModule {}

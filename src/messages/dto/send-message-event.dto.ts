import { IsUUID } from 'class-validator';

import { CreateMessageDto } from './create-message.dto';

export class SendMessageEventDto extends CreateMessageDto {
  @IsUUID()
  roomId: string;
}

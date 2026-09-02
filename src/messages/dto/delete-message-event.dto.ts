import { IsUUID } from 'class-validator';

export class DeleteMessageEventDto {
  @IsUUID()
  roomId: string;

  @IsUUID()
  messageId: string;

  @IsUUID()
  requesterId: string;
}

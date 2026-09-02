import { IsUUID } from 'class-validator';

export class DeleteRoomDto {
  @IsUUID()
  requesterId: string;
}

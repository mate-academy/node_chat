import { IsUUID } from 'class-validator';

export class ListRoomsQueryDto {
  @IsUUID()
  userId: string;
}

import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateMessageDto {
  @IsUUID()
  requesterId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text: string;
}

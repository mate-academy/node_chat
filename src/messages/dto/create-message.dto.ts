import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  authorId: string;

  @IsUUID()
  clientMessageId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text: string;
}

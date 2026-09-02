import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateChatProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;
}

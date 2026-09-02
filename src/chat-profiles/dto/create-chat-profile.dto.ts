import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChatProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phone must use international format, for example +15065551234',
  })
  phone?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  avatarUrl?: string;
}

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { RoomVisibility } from '../../generated/prisma/enums';

export class CreateRoomDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(RoomVisibility)
  visibility?: RoomVisibility;

  @IsUUID()
  ownerId: string;
}

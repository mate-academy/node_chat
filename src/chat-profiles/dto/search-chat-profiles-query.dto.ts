import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchChatProfilesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}

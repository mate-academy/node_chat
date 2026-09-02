import { IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  invitedById: string;

  @IsUUID()
  recipientId: string;
}

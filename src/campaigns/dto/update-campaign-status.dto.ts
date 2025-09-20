import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class UpdateCampaignStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la campagne',
    enum: CampaignStatus,
    example: 'active',
  })
  @IsEnum(CampaignStatus, { message: 'Le statut doit être valide' })
  status: CampaignStatus;
}
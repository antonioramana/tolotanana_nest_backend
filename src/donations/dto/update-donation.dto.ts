import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DonationStatus } from '@prisma/client';

export class UpdateDonationDto {
  @ApiPropertyOptional({
    description: 'Statut de la donation',
    enum: DonationStatus,
    example: 'completed',
  })
  @IsEnum(DonationStatus)
  @IsOptional()
  status?: DonationStatus;
}
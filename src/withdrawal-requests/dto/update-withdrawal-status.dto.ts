import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WithdrawalStatus } from '@prisma/client';

export class UpdateWithdrawalStatusDto {
  @ApiProperty({
    description: 'Nouveau statut de la demande',
    enum: WithdrawalStatus,
    example: 'approved',
  })
  @IsEnum(WithdrawalStatus, { message: 'Le statut doit être pending, approved, ou rejected' })
  status: WithdrawalStatus;

  @ApiPropertyOptional({
    description: 'Notes de l\'administrateur',
    example: 'Demande approuvée après vérification des documents',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
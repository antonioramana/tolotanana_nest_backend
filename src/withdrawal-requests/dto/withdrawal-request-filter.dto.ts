import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { WithdrawalStatus } from '@prisma/client';

export class WithdrawalRequestFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrer par campagne',
    example: 'clp123abc456def',
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par demandeur',
    example: 'clp123abc456def',
  })
  @IsOptional()
  @IsString()
  requestedBy?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: WithdrawalStatus,
    example: 'pending',
  })
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @ApiPropertyOptional({
    description: 'Montant minimum de la demande',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum de la demande',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Trier par champ',
    enum: ['createdAt', 'amount', 'processedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'amount', 'processedAt'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
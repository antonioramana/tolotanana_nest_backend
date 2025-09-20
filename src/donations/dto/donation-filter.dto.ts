import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DonationStatus } from '@prisma/client';

export class DonationFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrer par campagne',
    example: 'clp123abc456def',
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par donateur',
    example: 'clp123abc456def',
  })
  @IsOptional()
  @IsString()
  donorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: DonationStatus,
    example: 'completed',
  })
  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @ApiPropertyOptional({
    description: 'Montant minimum du don',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum du don',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par méthode de paiement',
    example: 'card',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par anonymat',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    description: 'Trier par champ',
    enum: ['createdAt', 'amount'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'amount'])
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
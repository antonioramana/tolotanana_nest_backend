import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus } from '@prisma/client';

export class CampaignFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    example: 'clp123abc456def',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CampaignStatus,
    example: 'active',
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Recherche textuelle dans le titre et la description',
    example: 'éducation',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum de l\'objectif',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum de l\'objectif',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Trier par champ',
    enum: ['createdAt', 'target_amount', 'current_amount', 'deadline', 'rating'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'target_amount', 'current_amount', 'deadline', 'rating'])
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

// DTO combiné pour accepter à la fois les filtres et la pagination en une seule fois
export class FindCampaignsQueryDto {
  // Filtres
  @ApiPropertyOptional({ description: 'Filtrer par catégorie' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Recherche textuelle' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Montant minimum de l'objectif", example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: "Montant maximum de l'objectif", example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Trier par champ', enum: ['createdAt', 'target_amount', 'current_amount', 'deadline', 'rating'] })
  @IsOptional()
  @IsEnum(['createdAt', 'target_amount', 'current_amount', 'deadline', 'rating'])
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Ordre de tri', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Pagination
  @ApiPropertyOptional({ description: 'Numéro de la page', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Nombre d'éléments par page", default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}



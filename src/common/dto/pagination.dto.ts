import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Numéro de la page',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;
}

export class PaginationMeta {
  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  limit: number;

  @ApiPropertyOptional()
  total: number;

  @ApiPropertyOptional()
  totalPages: number;

  @ApiPropertyOptional()
  hasNextPage: boolean;

  @ApiPropertyOptional()
  hasPreviousPage: boolean;
}

export class PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
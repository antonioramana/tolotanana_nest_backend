import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';

export class UpdatePlatformFeesDto {
  @ApiProperty({
    description: 'Pourcentage des frais de plateforme',
    example: 5.0,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({
    description: 'Description des frais (optionnel)',
    example: 'Frais de plateforme pour couvrir les coûts opérationnels',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Statut actif des frais',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

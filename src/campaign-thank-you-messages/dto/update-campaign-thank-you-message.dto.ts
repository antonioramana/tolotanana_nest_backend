import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateCampaignThankYouMessageDto {
  @ApiPropertyOptional({
    description: 'Message de remerciement personnalisé',
    example: 'Merci infiniment pour votre générosité ! Votre don nous aide énormément à atteindre notre objectif.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Le message ne peut pas dépasser 500 caractères' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Indique si ce message est actif',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

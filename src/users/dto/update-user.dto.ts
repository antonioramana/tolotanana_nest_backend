import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Prénom de l\'utilisateur',
    example: 'Jean',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Dupont',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Chemin ou URL de l\'avatar de l\'utilisateur',
    example: '/uploads/mon-avatar.jpg',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+33123456789',
  })
  @Matches(/^\+?\d{10,20}$/,
    { message: 'Le numéro de téléphone doit contenir 10 à 20 chiffres (optionnellement précédé de +)' })
  @IsOptional()
  phone?: string;
}
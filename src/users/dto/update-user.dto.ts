import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
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
    description: 'URL de l\'avatar de l\'utilisateur',
    example: 'https://example.com/avatar.jpg',
  })
  @IsUrl({}, { message: 'Veuillez fournir une URL d\'avatar valide' })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+33123456789',
  })
  @IsPhoneNumber('FR', { message: 'Veuillez fournir un numéro de téléphone valide' })
  @IsOptional()
  phone?: string;
}
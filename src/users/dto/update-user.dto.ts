import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Matches,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '@prisma/client';

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

  @ApiPropertyOptional({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    example: 'donateur',
  })
  @IsEnum(UserRole, { message: 'Le rôle doit être: demandeur, donateur, ou admin' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Statut de vérification du compte',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 6 caractères)',
    example: 'motdepasse123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'Jean',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Dupont',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Rôle de l\'utilisateur',
    enum: UserRole,
    default: 'donateur',
  })
  @IsEnum(UserRole, { message: 'Le rôle doit être: demandeur, donateur, ou admin' })
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+33123456789',
  })
  @IsPhoneNumber('FR', { message: 'Veuillez fournir un numéro de téléphone valide' })
  @IsOptional()
  phone?: string;
}
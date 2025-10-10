import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ChangeEmailRequestDto {
  @ApiProperty({
    description: 'Nouvelle adresse email',
    example: 'nouveau@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'La nouvelle adresse email est requise' })
  newEmail: string;

  @ApiProperty({
    description: 'Mot de passe actuel pour confirmation',
    example: 'motDePasse123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
  currentPassword: string;
}

export class ChangeEmailVerifyDto {
  @ApiProperty({
    description: 'Nouvelle adresse email',
    example: 'nouveau@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  newEmail: string;

  @ApiProperty({
    description: 'Code de vérification à 6 chiffres',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le code de vérification est requis' })
  verificationCode: string;
}

export class ChangeEmailResendDto {
  @ApiProperty({
    description: 'Adresse email pour renvoyer le code',
    example: 'nouveau@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  newEmail: string;
}

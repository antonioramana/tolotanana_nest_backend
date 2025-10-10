import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class DeleteAccountRequestDto {
  @ApiProperty({
    description: 'Adresse email de confirmation',
    example: 'utilisateur@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe actuel pour confirmation',
    example: 'motDePasse123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
  password: string;
}

export class DeleteAccountVerifyDto {
  @ApiProperty({
    description: 'Adresse email de confirmation',
    example: 'utilisateur@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;

  @ApiProperty({
    description: 'Code de vérification à 6 chiffres',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le code de vérification est requis' })
  verificationCode: string;
}

export class DeleteAccountResendDto {
  @ApiProperty({
    description: 'Adresse email pour renvoyer le code',
    example: 'utilisateur@email.com',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;
}

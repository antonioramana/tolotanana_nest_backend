import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'motdepasse123',
  })
  @IsString()
  password: string;
}
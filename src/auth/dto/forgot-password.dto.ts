import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString({ message: 'Code de vérification requis' })
  @Length(6, 6, { message: 'Le code doit contenir exactement 6 chiffres' })
  verificationCode: string;

  @IsNotEmpty({ message: 'Mot de passe requis' })
  password: string;
}

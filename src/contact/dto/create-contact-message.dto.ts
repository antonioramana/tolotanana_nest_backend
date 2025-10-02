import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({
    description: 'Nom de la personne qui contacte',
    example: 'Jean Dupont',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email de contact',
    example: 'jean.dupont@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Sujet du message',
    example: 'Question sur une campagne',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, j\'aimerais avoir des informations sur...',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateThankYouMessageDto {
  @ApiProperty({
    description: 'Message de remerciement personnalisé pour les donateurs',
    example: 'Merci pour votre générosité ! Votre soutien nous aide énormément.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le message de remerciement est requis' })
  @MaxLength(500, { message: 'Le message de remerciement ne doit pas dépasser 500 caractères' })
  thankYouMessage: string;
}

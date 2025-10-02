import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyContactMessageDto {
  @ApiProperty({
    description: 'Réponse de l\'administrateur',
    example: 'Merci pour votre message. Voici les informations demandées...',
  })
  @IsNotEmpty()
  @IsString()
  reply: string;
}

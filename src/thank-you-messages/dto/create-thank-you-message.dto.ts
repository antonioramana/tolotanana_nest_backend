import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateThankYouMessageDto {
  @ApiProperty({
    description: 'ID de la campagne',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la campagne est requis' })
  campaignId: string;

  @ApiProperty({
    description: 'ID de la donation à remercier',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la donation est requis' })
  donationId: string;

  @ApiProperty({
    description: 'Message de remerciement personnalisé',
    example: 'Merci beaucoup pour votre généreux don ! Grâce à vous, nous pouvons avancer sur notre projet.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le message de remerciement est requis' })
  message: string;
}
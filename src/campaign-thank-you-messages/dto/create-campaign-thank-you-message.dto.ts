import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCampaignThankYouMessageDto {
  @ApiProperty({
    description: 'ID de la campagne',
    example: 'clp123abc456def',
  })
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la campagne est requis' })
  campaignId: string;

  @ApiProperty({
    description: 'Message de remerciement personnalisé',
    example: 'Merci infiniment pour votre générosité ! Votre don nous aide énormément à atteindre notre objectif.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le message de remerciement est requis' })
  @MaxLength(500, { message: 'Le message ne peut pas dépasser 500 caractères' })
  message: string;
}




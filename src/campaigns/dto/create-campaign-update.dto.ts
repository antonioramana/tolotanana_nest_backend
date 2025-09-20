import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCampaignUpdateDto {
  @ApiProperty({
    description: 'Titre de l\'actualité',
    example: 'Mise à jour du projet',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string;

  @ApiProperty({
    description: 'Contenu de l\'actualité',
    example: 'Nous avons atteint 50% de notre objectif...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu est requis' })
  content: string;
}
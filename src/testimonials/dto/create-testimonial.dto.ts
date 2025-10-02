import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Nom de la personne qui témoigne',
    example: 'Marie Rasoanirina',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Rôle de la personne',
    example: 'Bénéficiaire',
    enum: ['Bénéficiaire', 'Créateur de campagne', 'Donatrice', 'Donateur', 'Utilisateur'],
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    description: 'URL de l\'avatar (optionnel)',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Contenu du témoignage',
    example: 'Grâce à TOLOTANANA, j\'ai pu collecter les fonds nécessaires pour l\'opération de ma fille...',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Nom de la campagne associée (optionnel)',
    example: 'Aide pour les frais médicaux de ma fille',
    required: false,
  })
  @IsOptional()
  @IsString()
  campaign?: string;

  @ApiProperty({
    description: 'Note sur 5 étoiles',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Témoignage actif ou inactif',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Témoignage mis en avant',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isHighlight?: boolean;
}

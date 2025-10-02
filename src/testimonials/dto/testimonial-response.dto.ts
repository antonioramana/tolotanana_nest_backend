import { ApiProperty } from '@nestjs/swagger';

export class TestimonialResponseDto {
  @ApiProperty({
    description: 'ID unique du témoignage',
    example: 'cm123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Nom de la personne qui témoigne',
    example: 'Marie Rasoanirina',
  })
  name: string;

  @ApiProperty({
    description: 'Rôle de la personne',
    example: 'Bénéficiaire',
  })
  role: string;

  @ApiProperty({
    description: 'URL de l\'avatar',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Contenu du témoignage',
    example: 'Grâce à TOLOTANANA, j\'ai pu collecter les fonds nécessaires...',
  })
  content: string;

  @ApiProperty({
    description: 'Nom de la campagne associée',
    example: 'Aide pour les frais médicaux de ma fille',
    required: false,
  })
  campaign?: string;

  @ApiProperty({
    description: 'Note sur 5 étoiles',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Témoignage actif ou inactif',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Témoignage mis en avant',
    example: false,
  })
  isHighlight: boolean;

  @ApiProperty({
    description: 'ID de l\'admin qui a créé',
    example: 'cm123456789',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Informations sur l\'admin qui a créé',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cm123456789' },
      firstName: { type: 'string', example: 'Admin' },
      lastName: { type: 'string', example: 'User' },
      email: { type: 'string', example: 'admin@tolotanana.com' },
    },
  })
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

import { ApiProperty } from '@nestjs/swagger';

export class ContactMessageResponseDto {
  @ApiProperty({
    description: 'ID du message de contact',
    example: 'cm123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Nom de la personne qui contacte',
    example: 'Jean Dupont',
  })
  name: string;

  @ApiProperty({
    description: 'Email de contact',
    example: 'jean.dupont@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Sujet du message',
    example: 'Question sur une campagne',
  })
  subject: string;

  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, j\'aimerais avoir des informations sur...',
  })
  message: string;

  @ApiProperty({
    description: 'Statut de lecture par l\'admin',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Statut de réponse',
    example: false,
  })
  isReplied: boolean;

  @ApiProperty({
    description: 'Réponse de l\'admin',
    example: 'Merci pour votre message...',
    required: false,
  })
  reply?: string;

  @ApiProperty({
    description: 'Date de réponse',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  repliedAt?: Date;

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
    description: 'Informations sur l\'admin qui a répondu',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cm123456789' },
      firstName: { type: 'string', example: 'Admin' },
      lastName: { type: 'string', example: 'User' },
      email: { type: 'string', example: 'admin@tolotanana.com' },
    },
    required: false,
  })
  replier?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

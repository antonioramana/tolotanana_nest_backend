import { ApiProperty } from '@nestjs/swagger';

export class PlatformFeesResponseDto {
  @ApiProperty({
    description: 'ID des frais de plateforme',
    example: 'cm123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Pourcentage des frais de plateforme',
    example: 5.0,
  })
  percentage: number;

  @ApiProperty({
    description: 'Statut actif des frais',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Description des frais',
    example: 'Frais de plateforme pour couvrir les coûts opérationnels',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID de l\'administrateur qui a créé/modifié',
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
    description: 'Informations sur le créateur',
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

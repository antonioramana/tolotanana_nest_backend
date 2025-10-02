import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Public Testimonials')
@Controller('public/testimonials')
export class PublicTestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les témoignages actifs (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des témoignages actifs récupérée',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cm123456789' },
          name: { type: 'string', example: 'Marie Rasoanirina' },
          role: { type: 'string', example: 'Bénéficiaire' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          content: { type: 'string', example: 'Grâce à TOLOTANANA...' },
          campaign: { type: 'string', example: 'Aide pour les frais médicaux' },
          rating: { type: 'number', example: 5 },
          isHighlight: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  findAll() {
    return this.testimonialsService.findPublic();
  }

  @Get('highlighted')
  @ApiOperation({ summary: 'Obtenir les témoignages mis en avant (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Témoignages mis en avant récupérés (max 6)',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cm123456789' },
          name: { type: 'string', example: 'Marie Rasoanirina' },
          role: { type: 'string', example: 'Bénéficiaire' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          content: { type: 'string', example: 'Grâce à TOLOTANANA...' },
          campaign: { type: 'string', example: 'Aide pour les frais médicaux' },
          rating: { type: 'number', example: 5 },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        },
      },
    },
  })
  findHighlighted() {
    return this.testimonialsService.findHighlighted();
  }
}

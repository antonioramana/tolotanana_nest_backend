import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialResponseDto } from './dto/testimonial-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Testimonials (Admin)')
@Controller('testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau témoignage (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Témoignage créé avec succès',
    type: TestimonialResponseDto,
  })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.testimonialsService.create(createTestimonialDto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les témoignages (Admin uniquement)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'Inclure les témoignages inactifs',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des témoignages récupérée',
    type: [TestimonialResponseDto],
  })
  findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.testimonialsService.findAll(include);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des témoignages (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 25 },
        active: { type: 'number', example: 20 },
        highlighted: { type: 'number', example: 6 },
        averageRating: { type: 'number', example: 4.8 },
        byRole: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', example: 'Bénéficiaire' },
              count: { type: 'number', example: 8 },
            },
          },
        },
      },
    },
  })
  getStats() {
    return this.testimonialsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un témoignage par ID (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Témoignage trouvé',
    type: TestimonialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Témoignage non trouvé',
  })
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un témoignage (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Témoignage mis à jour',
    type: TestimonialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Témoignage non trouvé',
  })
  update(
    @Param('id') id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto, adminId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activer/Désactiver un témoignage (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statut du témoignage modifié',
    type: TestimonialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Témoignage non trouvé',
  })
  toggleActive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.testimonialsService.toggleActive(id, adminId);
  }

  @Patch(':id/toggle-highlight')
  @ApiOperation({ summary: 'Mettre en avant/Retirer un témoignage (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statut de mise en avant modifié',
    type: TestimonialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Témoignage non trouvé',
  })
  toggleHighlight(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.testimonialsService.toggleHighlight(id, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un témoignage (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Témoignage supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Témoignage non trouvé',
  })
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}

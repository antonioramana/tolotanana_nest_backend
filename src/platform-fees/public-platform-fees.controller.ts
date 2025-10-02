import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PlatformFeesService } from './platform-fees.service';

@ApiTags('Public Platform Fees')
@Controller('public/platform-fees')
export class PublicPlatformFeesController {
  constructor(private platformFeesService: PlatformFeesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Obtenir les frais de plateforme actifs (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme actifs récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        percentage: {
          type: 'number',
          example: 5.0,
          description: 'Pourcentage des frais de plateforme',
        },
        description: {
          type: 'string',
          example: 'Frais de plateforme pour couvrir les coûts opérationnels',
          description: 'Description des frais',
        },
      },
    },
  })
  async getActivePercentage() {
    const activeFees = await this.platformFeesService.findActive();
    return {
      percentage: activeFees.percentage,
      description: activeFees.description,
    };
  }
}

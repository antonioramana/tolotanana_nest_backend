import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { StatisticsFilterDto } from './dto/statistics-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du tableau de bord récupérées avec succès',
    type: DashboardStatsResponseDto,
  })
  async getDashboardStats(@Query() filters: StatisticsFilterDto) {
    return this.statisticsService.getDashboardStats(filters);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques de la campagne récupérées avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  async getCampaignStats(@Param('id') id: string) {
    const stats = await this.statisticsService.getCampaignStats(id);
    if (!stats) {
      return { message: 'Campagne non trouvée' };
    }
    return stats;
  }

  @Get('users/me')
  @ApiOperation({ summary: 'Obtenir mes statistiques utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques utilisateur récupérées avec succès',
  })
  async getUserStats(@CurrentUser('id') userId: string) {
    return this.statisticsService.getUserStats(userId);
  }

  @Get('top-campaigns')
  @ApiOperation({ summary: 'Obtenir les meilleures campagnes' })
  @ApiResponse({
    status: 200,
    description: 'Meilleures campagnes récupérées avec succès',
  })
  async getTopCampaigns(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.statisticsService.getTopCampaigns(parsedLimit);
  }

  @Get('recent-donations')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir les donations récentes (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Donations récentes récupérées avec succès',
  })
  async getRecentDonations(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.statisticsService.getRecentDonations(parsedLimit);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtenir les statistiques par catégorie' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des catégories récupérées avec succès',
  })
  async getCategoryStats() {
    return this.statisticsService.getCategoryStats();
  }
}
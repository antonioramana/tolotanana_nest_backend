import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Dashboard (Admin)')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtenir toutes les statistiques du dashboard (Admin uniquement)',
    description: `
    Récupère toutes les statistiques nécessaires pour le dashboard admin :
    - Statistiques générales (total collecté, frais plateforme, etc.)
    - Évolution des revenus par mois
    - Répartition des campagnes par catégorie
    - Donations importantes récentes
    - Nouvelles campagnes récentes
    - Nouveaux utilisateurs récents
    - Évolution des inscriptions et créations
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du dashboard récupérées avec succès',
    type: DashboardStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - Token JWT requis',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle admin requis',
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getDashboardStats();
  }
}

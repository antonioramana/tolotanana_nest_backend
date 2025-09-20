import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignVerificationService } from './campaign-verification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Campaign Verification')
@Controller('campaigns/verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignVerificationController {
  constructor(
    private readonly campaignVerificationService: CampaignVerificationService,
  ) {}

  @Post('manual')
  @Roles('admin')
  @ApiOperation({ summary: 'Déclencher une vérification manuelle des campagnes (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Vérification manuelle déclenchée avec succès',
  })
  async triggerManualVerification() {
    await this.campaignVerificationService.manualVerification();
    return {
      message: 'Vérification manuelle des campagnes déclenchée avec succès',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir les statistiques de vérification des campagnes (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques de vérification récupérées avec succès',
  })
  async getVerificationStats() {
    const stats = await this.campaignVerificationService.getVerificationStats();
    return {
      message: 'Statistiques de vérification récupérées avec succès',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }
}


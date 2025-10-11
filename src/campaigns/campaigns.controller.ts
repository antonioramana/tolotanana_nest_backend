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
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { UpdateThankYouMessageDto } from './dto/update-thank-you-message.dto';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateCampaignStatusDto } from './dto/update-campaign-status.dto';
import { CreateCampaignUpdateDto } from './dto/create-campaign-update.dto';
import { FindCampaignsQueryDto } from './dto/find-campaigns-query.dto';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle campagne' })
  @ApiResponse({
    status: 201,
    description: 'Campagne créée avec succès',
  })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.create(createCampaignDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir toutes les campagnes avec filtres' })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes récupérée avec succès',
  })
  async findAll(
    @Query() query: FindCampaignsQueryDto,
    @CurrentUser('id') userId?: string,
  ) {
    const { page = 1, limit = 10, ...filters } = query as any;
    return this.campaignsService.findAll(filters as CampaignFilterDto, { page, limit } as PaginationDto, userId);
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir les campagnes de l\'utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes de l\'utilisateur récupérée avec succès',
  })
  async findMyCampaigns(
    @Query() query: FindCampaignsQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    const { page = 1, limit = 10, ...filters } = query as any;
    return this.campaignsService.findMyCampaigns(userId, filters as CampaignFilterDto, { page, limit } as PaginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une campagne par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Campagne trouvée avec statistiques',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.campaignsService.findOne(id, userId);
  }

  @Get(':id/donations')
  @ApiOperation({ summary: 'Obtenir les dons d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Liste des dons de la campagne',
  })
  async getCampaignDonations(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.campaignsService.getCampaignDonations(id, pagination);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Campagne mise à jour avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Non autorisé à modifier cette campagne',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.update(id, updateCampaignDto, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Changer le statut d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Statut de la campagne mis à jour',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCampaignStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.updateStatus(id, updateStatusDto, userId);
  }

  @Patch(':id/admin-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Changer le statut d\'une campagne (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statut de la campagne mis à jour par un admin',
  })
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCampaignStatusDto,
  ) {
    return this.campaignsService.adminUpdateStatus(id, updateStatusDto);
  }

  @Post(':id/toggle-favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Basculer le statut favori d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Statut favori basculé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  async toggleFavorite(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.toggleFavorite(campaignId, userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ajouter une campagne aux favoris' })
  @ApiResponse({
    status: 200,
    description: 'Campagne ajoutée aux favoris',
  })
  async addToFavorites(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.campaignsService.addToFavorites(campaignId, userId);
    return { message: 'Campagne ajoutée aux favoris' };
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retirer une campagne des favoris' })
  @ApiResponse({
    status: 200,
    description: 'Campagne retirée des favoris',
  })
  async removeFromFavorites(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.campaignsService.removeFromFavorites(campaignId, userId);
    return { message: 'Campagne retirée des favoris' };
  }

  @Post(':id/updates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publier une actualité pour la campagne' })
  @ApiResponse({
    status: 201,
    description: 'Actualité publiée avec succès',
  })
  async createUpdate(
    @Param('id') campaignId: string,
    @Body() createUpdateDto: CreateCampaignUpdateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.createUpdate(campaignId, createUpdateDto, userId);
  }

  @Get(':id/updates')
  @ApiOperation({ summary: 'Obtenir les actualités d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Liste des actualités de la campagne',
  })
  async getUpdates(
    @Param('id') campaignId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.campaignsService.getUpdates(campaignId, pagination);
  }

  @Delete(':id/updates/:updateId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une actualité de campagne' })
  @ApiResponse({
    status: 200,
    description: 'Actualité supprimée avec succès',
  })
  async deleteUpdate(
    @Param('id') campaignId: string,
    @Param('updateId') updateId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.deleteUpdate(campaignId, updateId, userId);
  }

  @Patch(':id/thank-you-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour le message de remerciement d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement mis à jour avec succès',
  })
  async updateThankYouMessage(
    @Param('id') campaignId: string,
    @Body() updateThankYouMessageDto: UpdateThankYouMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.updateThankYouMessage(campaignId, updateThankYouMessageDto, userId);
  }

  @Post(':id/recalculate-amount')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recalculer le montant collecté d\'une campagne (Admin seulement)' })
  @ApiResponse({
    status: 200,
    description: 'Montant recalculé avec succès',
  })
  async recalculateCampaignAmount(@Param('id') campaignId: string) {
    return this.campaignsService.recalculateCampaignAmount(campaignId);
  }

  @Post('recalculate-all-amounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recalculer les montants collectés de toutes les campagnes (Admin seulement)' })
  @ApiResponse({
    status: 200,
    description: 'Montants recalculés avec succès',
  })
  async recalculateAllCampaignAmounts() {
    return this.campaignsService.recalculateAllCampaignAmounts();
  }

  @Post(':id/recalculate-total-raised')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recalculer le montant total collecté d\'une campagne (actuel + retraits) (Admin seulement)' })
  @ApiResponse({
    status: 200,
    description: 'Montant total collecté recalculé avec succès',
  })
  async recalculateCampaignTotalRaised(@Param('id') campaignId: string) {
    return this.campaignsService.recalculateCampaignTotalRaised(campaignId);
  }

  @Post('recalculate-all-total-raised')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Recalculer le montant total collecté de toutes les campagnes (Admin seulement)' })
  @ApiResponse({
    status: 200,
    description: 'Montants totaux collectés recalculés avec succès',
  })
  async recalculateAllCampaignTotalRaised() {
    return this.campaignsService.recalculateAllCampaignTotalRaised();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Campagne supprimée avec succès',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.campaignsService.remove(id, userId);
    return { message: 'Campagne supprimée avec succès' };
  }
}
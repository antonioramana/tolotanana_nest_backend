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
import { CampaignThankYouMessagesService } from './campaign-thank-you-messages.service';
import { CreateCampaignThankYouMessageDto } from './dto/create-campaign-thank-you-message.dto';
import { UpdateCampaignThankYouMessageDto } from './dto/update-campaign-thank-you-message.dto';
import { CampaignThankYouMessageResponseDto } from './dto/campaign-thank-you-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Campaign Thank You Messages')
@Controller('campaign-thank-you-messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CampaignThankYouMessagesController {
  constructor(private campaignThankYouMessagesService: CampaignThankYouMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau message de remerciement pour une campagne' })
  @ApiResponse({
    status: 201,
    description: 'Message de remerciement créé avec succès',
    type: CampaignThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé à cette campagne',
  })
  async create(
    @Body() createDto: CreateCampaignThankYouMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les messages de remerciement d\'une campagne' })
  @ApiQuery({ name: 'campaignId', required: true, description: 'ID de la campagne' })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages de remerciement récupérée avec succès',
    type: [CampaignThankYouMessageResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé à cette campagne',
  })
  async findAll(
    @Query('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.findAll(campaignId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un message de remerciement par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement trouvé',
    type: CampaignThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un message de remerciement' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement mis à jour avec succès',
    type: CampaignThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCampaignThankYouMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un message de remerciement' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.remove(id, userId);
  }

  @Patch(':id/set-active')
  @ApiOperation({ summary: 'Définir un message de remerciement comme actif' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement défini comme actif',
    type: CampaignThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async setActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignThankYouMessagesService.setActive(id, userId);
  }
}















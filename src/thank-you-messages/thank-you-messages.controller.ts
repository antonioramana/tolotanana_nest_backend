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
import { ThankYouMessagesService } from './thank-you-messages.service';
import { CreateThankYouMessageDto } from './dto/create-thank-you-message.dto';
import { UpdateThankYouMessageDto } from './dto/update-thank-you-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ThankYouMessageResponseDto } from './dto/thank-you-message-response.dto';

@ApiTags('Thank You Messages')
@Controller('thank-you-messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ThankYouMessagesController {
  constructor(private thankYouMessagesService: ThankYouMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message de remerciement à un donateur' })
  @ApiResponse({
    status: 201,
    description: 'Message de remerciement envoyé avec succès',
    type: ThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Campagne non autorisée ou message déjà envoyé',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne ou donation non trouvée',
  })
  async create(
    @Body() createThankYouMessageDto: CreateThankYouMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.thankYouMessagesService.create(createThankYouMessageDto, userId);
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Obtenir les messages de remerciement d\'une campagne' })
  @ApiResponse({
    status: 200,
    description: 'Messages de remerciement récupérés avec succès',
  })
  async findAll(
    @Param('campaignId') campaignId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.thankYouMessagesService.findAll(campaignId, pagination);
  }

  @Get('my-campaign/:campaignId')
  @ApiOperation({ summary: 'Obtenir les messages de remerciement de ma campagne' })
  @ApiResponse({
    status: 200,
    description: 'Messages de remerciement de ma campagne récupérés avec succès',
  })
  async getCampaignThankYouMessages(
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.thankYouMessagesService.getCampaignThankYouMessages(campaignId, userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un message de remerciement par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement trouvé',
    type: ThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  async findOne(@Param('id') id: string) {
    return this.thankYouMessagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un message de remerciement' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement modifié avec succès',
    type: ThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Non autorisé à modifier ce message',
  })
  @ApiResponse({
    status: 404,
    description: 'Message de remerciement non trouvé',
  })
  async update(
    @Param('id') id: string,
    @Body() updateThankYouMessageDto: UpdateThankYouMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.thankYouMessagesService.update(id, updateThankYouMessageDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un message de remerciement' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement supprimé avec succès',
  })
  @ApiResponse({
    status: 403,
    description: 'Non autorisé à supprimer ce message',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.thankYouMessagesService.remove(id, userId);
    return { message: 'Message de remerciement supprimé avec succès' };
  }
}
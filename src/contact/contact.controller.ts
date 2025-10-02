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
import { ContactService } from './contact.service';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';
import { ContactMessageResponseDto } from './dto/contact-message-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Contact Messages (Admin)')
@Controller('contact')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les messages de contact (Admin uniquement)' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page', example: 10 })
  @ApiQuery({ name: 'filter', required: false, enum: ['unread', 'replied', 'all'], description: 'Filtre des messages' })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages de contact récupérée avec succès',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: 'unread' | 'replied' | 'all',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.contactService.findAll(pageNum, limitNum, filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des messages de contact (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 25 },
        unread: { type: 'number', example: 5 },
        replied: { type: 'number', example: 15 },
        pending: { type: 'number', example: 10 },
      },
    },
  })
  async getStats() {
    return this.contactService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un message de contact par ID (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Message de contact trouvé',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de contact non trouvé',
  })
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer un message comme lu (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Message marqué comme lu avec succès',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de contact non trouvé',
  })
  async markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Répondre à un message de contact (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Réponse envoyée avec succès',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message de contact non trouvé',
  })
  async reply(
    @Param('id') id: string,
    @Body() replyDto: ReplyContactMessageDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.contactService.reply(id, replyDto, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un message de contact (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Message de contact supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Message de contact non trouvé',
  })
  async remove(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}

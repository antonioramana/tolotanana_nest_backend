import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post('toggle/:campaignId')
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
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.toggleFavorite(campaignId, userId);
  }

  @Get('my-favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir les campagnes favorites de l\'utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes favorites récupérée avec succès',
  })
  async getMyFavorites(
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    const { page = 1, limit = 10 } = pagination;
    return this.favoritesService.getUserFavorites(userId, { page, limit });
  }

  @Post(':campaignId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ajouter une campagne aux favoris' })
  @ApiResponse({
    status: 200,
    description: 'Campagne ajoutée aux favoris',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  @ApiResponse({
    status: 409,
    description: 'Campagne déjà dans les favoris',
  })
  async addToFavorites(
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.addToFavorites(campaignId, userId);
  }

  @Delete(':campaignId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retirer une campagne des favoris' })
  @ApiResponse({
    status: 200,
    description: 'Campagne retirée des favoris',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée dans les favoris',
  })
  async removeFromFavorites(
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.removeFromFavorites(campaignId, userId);
  }
}

import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CampaignFilterDto } from './dto/campaign-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindCampaignsQueryDto } from './dto/find-campaigns-query.dto';

@ApiTags('Public Campaigns')
@Controller('public/campaigns')
export class PublicCampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les campagnes publiques (sans authentification)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes publiques récupérée avec succès',
  })
  async findAll(
    @Query() query: FindCampaignsQueryDto,
  ) {
    const { page = 1, limit = 10, ...filters } = query as any;
    // Passer userId comme undefined pour les campagnes publiques
    return this.campaignsService.findAll(filters as CampaignFilterDto, { page, limit } as PaginationDto, undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une campagne publique par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Campagne publique trouvée avec statistiques',
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  async findOne(@Param('id') id: string) {
    // Passer userId comme undefined pour les campagnes publiques
    return this.campaignsService.findOne(id, undefined);
  }
}

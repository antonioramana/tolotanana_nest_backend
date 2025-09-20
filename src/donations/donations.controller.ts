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
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationFilterDto } from './dto/donation-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DonationResponseDto } from './dto/donation-response.dto';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle donation (publique)' })
  @ApiResponse({
    status: 201,
    description: 'Donation créée avec succès',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvée',
  })
  @ApiResponse({
    status: 400,
    description: 'Campagne inactive ou expirée',
  })
  async create(
    @Body() createDonationDto: CreateDonationDto,
    @CurrentUser('id') donorId?: string,
  ) {
    return this.donationsService.create(createDonationDto, donorId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir toutes les donations avec filtres (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des donations récupérée avec succès',
  })
  async findAll(
    @Query() filters: DonationFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.donationsService.findAll(filters, pagination);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir les statistiques des donations (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des donations',
  })
  async getStats() {
    return this.donationsService.getDonationStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une donation par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Donation trouvée',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Donation non trouvée',
  })
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une donation (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Donation mise à jour avec succès',
    type: DonationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Donation non trouvée',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationsService.update(id, updateDonationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une donation (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Donation supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation non trouvée',
  })
  async remove(@Param('id') id: string) {
    await this.donationsService.remove(id);
    return { message: 'Donation supprimée avec succès' };
  }
}
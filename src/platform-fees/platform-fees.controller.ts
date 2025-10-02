import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformFeesService } from './platform-fees.service';
import { CreatePlatformFeesDto } from './dto/create-platform-fees.dto';
import { UpdatePlatformFeesDto } from './dto/update-platform-fees.dto';
import { PlatformFeesResponseDto } from './dto/platform-fees-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Platform Fees')
@Controller('platform-fees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class PlatformFeesController {
  constructor(private platformFeesService: PlatformFeesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer de nouveaux frais de plateforme (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Frais de plateforme créés avec succès',
    type: PlatformFeesResponseDto,
  })
  async create(
    @Body() createDto: CreatePlatformFeesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.platformFeesService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les frais de plateforme (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des frais de plateforme récupérée avec succès',
    type: [PlatformFeesResponseDto],
  })
  async findAll() {
    return this.platformFeesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtenir les frais de plateforme actifs (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme actifs récupérés avec succès',
    type: PlatformFeesResponseDto,
  })
  async findActive() {
    return this.platformFeesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir des frais de plateforme par ID (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme trouvés',
    type: PlatformFeesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Frais de plateforme non trouvés',
  })
  async findOne(@Param('id') id: string) {
    return this.platformFeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour des frais de plateforme (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme mis à jour avec succès',
    type: PlatformFeesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Frais de plateforme non trouvés',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlatformFeesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.platformFeesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer des frais de plateforme (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme supprimés avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Frais de plateforme non trouvés',
  })
  @ApiResponse({
    status: 409,
    description: 'Impossible de supprimer le seul frais actif',
  })
  async remove(@Param('id') id: string) {
    return this.platformFeesService.remove(id);
  }

  @Patch(':id/set-active')
  @ApiOperation({ summary: 'Définir des frais comme actifs (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Frais de plateforme définis comme actifs avec succès',
    type: PlatformFeesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Frais de plateforme non trouvés',
  })
  async setActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.platformFeesService.setActive(id, userId);
  }
}

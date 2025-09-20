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
import { TermsOfServiceService } from './terms-of-service.service';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { UpdateTermsOfServiceDto } from './dto/update-terms-of-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Terms of Service')
@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsOfServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle politique d\'utilisation' })
  @ApiResponse({
    status: 201,
    description: 'Politique d\'utilisation créée avec succès',
  })
  create(@Body() createTermsOfServiceDto: CreateTermsOfServiceDto) {
    return this.termsOfServiceService.create(createTermsOfServiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir toutes les politiques d\'utilisation' })
  @ApiResponse({
    status: 200,
    description: 'Liste des politiques d\'utilisation',
  })
  findAll() {
    return this.termsOfServiceService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtenir la politique d\'utilisation active' })
  @ApiResponse({
    status: 200,
    description: 'Politique d\'utilisation active',
  })
  findActive() {
    return this.termsOfServiceService.findActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une politique d\'utilisation par ID' })
  @ApiResponse({
    status: 200,
    description: 'Politique d\'utilisation trouvée',
  })
  findOne(@Param('id') id: string) {
    return this.termsOfServiceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une politique d\'utilisation' })
  @ApiResponse({
    status: 200,
    description: 'Politique d\'utilisation mise à jour avec succès',
  })
  update(
    @Param('id') id: string,
    @Body() updateTermsOfServiceDto: UpdateTermsOfServiceDto,
  ) {
    return this.termsOfServiceService.update(id, updateTermsOfServiceDto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activer une politique d\'utilisation' })
  @ApiResponse({
    status: 200,
    description: 'Politique d\'utilisation activée avec succès',
  })
  activate(@Param('id') id: string) {
    return this.termsOfServiceService.activate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une politique d\'utilisation' })
  @ApiResponse({
    status: 200,
    description: 'Politique d\'utilisation supprimée avec succès',
  })
  remove(@Param('id') id: string) {
    return this.termsOfServiceService.remove(id);
  }
}

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
import { BankInfoService } from './bank-info.service';
import { CreateBankInfoDto } from './dto/create-bank-info.dto';
import { UpdateBankInfoDto } from './dto/update-bank-info.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BankInfoResponseDto } from './dto/bank-info-response.dto';

@ApiTags('Bank Info')
@Controller('bank-info')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BankInfoController {
  constructor(private bankInfoService: BankInfoService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter une nouvelle information bancaire' })
  @ApiResponse({
    status: 201,
    description: 'Information bancaire créée avec succès',
    type: BankInfoResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ces informations bancaires existent déjà',
  })
  async create(
    @Body() createBankInfoDto: CreateBankInfoDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bankInfoService.create(createBankInfoDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes mes informations bancaires' })
  @ApiResponse({
    status: 200,
    description: 'Liste des informations bancaires récupérée avec succès',
    type: [BankInfoResponseDto],
  })
  async findAll(@CurrentUser('id') userId: string) {
    return this.bankInfoService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une information bancaire par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Information bancaire trouvée',
    type: BankInfoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Information bancaire non trouvée',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bankInfoService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une information bancaire' })
  @ApiResponse({
    status: 200,
    description: 'Information bancaire mise à jour avec succès',
    type: BankInfoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Information bancaire non trouvée',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBankInfoDto: UpdateBankInfoDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bankInfoService.update(id, updateBankInfoDto, userId);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Définir cette information bancaire comme défaut' })
  @ApiResponse({
    status: 200,
    description: 'Information bancaire définie comme défaut',
    type: BankInfoResponseDto,
  })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bankInfoService.setDefault(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une information bancaire' })
  @ApiResponse({
    status: 200,
    description: 'Information bancaire supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Information bancaire non trouvée',
  })
  @ApiResponse({
    status: 409,
    description: 'Information bancaire utilisée dans des demandes de retrait',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.bankInfoService.remove(id, userId);
    return { message: 'Information bancaire supprimée avec succès' };
  }
}
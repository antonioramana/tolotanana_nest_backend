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
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { CreateWithdrawalRequestDto } from './dto/create-withdrawal-request.dto';
import { WithdrawalRequestFilterDto } from './dto/withdrawal-request-filter.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { WithdrawalRequestResponseDto } from './dto/withdrawal-request-response.dto';

@ApiTags('Withdrawal Requests')
@Controller('withdrawal-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WithdrawalRequestsController {
  constructor(private withdrawalRequestsService: WithdrawalRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle demande de retrait' })
  @ApiResponse({
    status: 201,
    description: 'Demande de retrait créée avec succès',
    type: WithdrawalRequestResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Campagne non autorisée ou informations bancaires invalides',
  })
  @ApiResponse({
    status: 400,
    description: 'Montant supérieur au solde disponible',
  })
  async create(
    @Body() createWithdrawalRequestDto: CreateWithdrawalRequestDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.withdrawalRequestsService.create(createWithdrawalRequestDto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir toutes les demandes de retrait (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des demandes de retrait récupérée avec succès',
  })
  async findAll(
    @Query() filters: WithdrawalRequestFilterDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.withdrawalRequestsService.findAll(filters, pagination);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Obtenir mes demandes de retrait' })
  @ApiResponse({
    status: 200,
    description: 'Mes demandes de retrait récupérées avec succès',
  })
  async getUserRequests(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.withdrawalRequestsService.getUserRequests(userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une demande de retrait par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Demande de retrait trouvée',
    type: WithdrawalRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Demande de retrait non trouvée',
  })
  async findOne(@Param('id') id: string) {
    return this.withdrawalRequestsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Traiter une demande de retrait (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Demande de retrait traitée avec succès',
    type: WithdrawalRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Demande déjà traitée',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateWithdrawalStatusDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.withdrawalRequestsService.updateStatus(id, updateStatusDto, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande de retrait en attente' })
  @ApiResponse({
    status: 200,
    description: 'Demande de retrait supprimée avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer une demande traitée',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.withdrawalRequestsService.remove(id, userId);
    return { message: 'Demande de retrait supprimée avec succès' };
  }
}
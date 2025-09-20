import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtenir mon profil utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    type: UserProfileResponseDto,
  })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: UserProfileResponseDto,
  })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Get('donations')
  @ApiOperation({ summary: 'Obtenir l\'historique de mes dons' })
  @ApiResponse({
    status: 200,
    description: 'Historique des dons récupéré avec succès',
  })
  async getUserDonations(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getUserDonations(userId, pagination);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Obtenir mes campagnes favorites' })
  @ApiResponse({
    status: 200,
    description: 'Campagnes favorites récupérées avec succès',
  })
  async getUserFavorites(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getUserFavorites(userId, pagination);
  }

  // Admin endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir tous les utilisateurs (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
  })
  async getAllUsers(@Query() pagination: PaginationDto) {
    return this.usersService.getAllUsers(pagination);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur récupéré avec succès',
    type: UserProfileResponseDto,
  })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    type: UserProfileResponseDto,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
  })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
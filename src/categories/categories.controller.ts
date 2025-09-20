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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Une catégorie avec ce nom existe déjà',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir toutes les catégories' })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories récupérée avec succès',
    type: [CategoryResponseDto],
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie par son ID' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie trouvée',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Catégorie non trouvée',
  })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une catégorie (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour avec succès',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Catégorie non trouvée',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une catégorie (Admin uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Catégorie supprimée avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Catégorie non trouvée',
  })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
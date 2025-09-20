import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        campaigns: {
          where: { status: 'active' },
          take: 10,
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { campaigns: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return category;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Catégorie non trouvée');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Catégorie non trouvée');
      }
      throw error;
    }
  }
}
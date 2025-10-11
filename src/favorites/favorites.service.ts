import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(campaignId: string, userId: string) {
    // Vérifier que la campagne existe
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    // Vérifier si le favori existe déjà
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
    });

    if (existingFavorite) {
      // Supprimer le favori
      await this.prisma.favorite.delete({
        where: {
          userId_campaignId: {
            userId,
            campaignId,
          },
        },
      });
      return { isFavoris: false, message: 'Campagne retirée des favoris' };
    } else {
      // Ajouter le favori
      await this.prisma.favorite.create({
        data: {
          userId,
          campaignId,
        },
      });
      return { isFavoris: true, message: 'Campagne ajoutée aux favoris' };
    }
  }

  async isFavorite(campaignId: string, userId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
    });

    return !!favorite;
  }

  async getUserFavorites(userId: string, pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: {
          campaign: {
            include: {
              category: true,
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              _count: {
                select: { donations: true, favorites: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: favorites.map(fav => ({
        ...fav.campaign,
        isFavoris: true, // Toujours true dans cette liste
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async addToFavorites(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    try {
      await this.prisma.favorite.create({
        data: {
          userId,
          campaignId,
        },
      });
      return { isFavoris: true, message: 'Campagne ajoutée aux favoris' };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Cette campagne est déjà dans vos favoris');
      }
      throw error;
    }
  }

  async removeFromFavorites(campaignId: string, userId: string) {
    try {
      await this.prisma.favorite.delete({
        where: {
          userId_campaignId: {
            userId,
            campaignId,
          },
        },
      });
      return { isFavoris: false, message: 'Campagne retirée des favoris' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Cette campagne n\'est pas dans vos favoris');
      }
      throw error;
    }
  }
}

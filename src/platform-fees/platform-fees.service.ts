import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlatformFeesDto } from './dto/create-platform-fees.dto';
import { UpdatePlatformFeesDto } from './dto/update-platform-fees.dto';

@Injectable()
export class PlatformFeesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePlatformFeesDto, userId: string) {
    // Désactiver tous les autres frais actifs avant de créer le nouveau
    await this.prisma.platformFees.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return this.prisma.platformFees.create({
      data: {
        ...createDto,
        createdBy: userId,
        isActive: true, // Le nouveau frais devient automatiquement actif
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.platformFees.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findActive() {
    const activeFees = await this.prisma.platformFees.findFirst({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Si aucun frais actif n'existe, créer un frais par défaut de 5%
    if (!activeFees) {
      return this.createDefaultFees();
    }

    return activeFees;
  }

  async findOne(id: string) {
    const fees = await this.prisma.platformFees.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!fees) {
      throw new NotFoundException('Frais de plateforme non trouvés');
    }

    return fees;
  }

  async update(id: string, updateDto: UpdatePlatformFeesDto, userId: string) {
    const fees = await this.prisma.platformFees.findUnique({
      where: { id },
    });

    if (!fees) {
      throw new NotFoundException('Frais de plateforme non trouvés');
    }

    // Si on active ces frais, désactiver tous les autres
    if (updateDto.isActive === true) {
      await this.prisma.platformFees.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false },
      });
    }

    return this.prisma.platformFees.update({
      where: { id },
      data: {
        ...updateDto,
        createdBy: userId, // Mettre à jour le créateur avec l'admin qui modifie
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const fees = await this.prisma.platformFees.findUnique({
      where: { id },
    });

    if (!fees) {
      throw new NotFoundException('Frais de plateforme non trouvés');
    }

    // Ne pas permettre la suppression si c'est le seul frais actif
    if (fees.isActive) {
      const otherActiveFees = await this.prisma.platformFees.count({
        where: { 
          isActive: true,
          id: { not: id }
        },
      });

      if (otherActiveFees === 0) {
        throw new ConflictException('Impossible de supprimer le seul frais actif. Créez d\'abord un autre frais.');
      }
    }

    await this.prisma.platformFees.delete({
      where: { id },
    });

    return { message: 'Frais de plateforme supprimés avec succès' };
  }

  async setActive(id: string, userId: string) {
    const fees = await this.prisma.platformFees.findUnique({
      where: { id },
    });

    if (!fees) {
      throw new NotFoundException('Frais de plateforme non trouvés');
    }

    // Désactiver tous les autres frais
    await this.prisma.platformFees.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activer ces frais
    return this.prisma.platformFees.update({
      where: { id },
      data: { 
        isActive: true,
        createdBy: userId, // Mettre à jour avec l'admin qui active
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Méthode utilitaire pour obtenir le pourcentage actuel
  async getCurrentPercentage(): Promise<number> {
    const activeFees = await this.findActive();
    return activeFees.percentage;
  }

  // Créer des frais par défaut si aucun n'existe
  private async createDefaultFees() {
    // Chercher un admin pour créer les frais par défaut
    const admin = await this.prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!admin) {
      // Si aucun admin n'existe, créer des frais sans créateur (cas d'urgence)
      throw new NotFoundException('Aucun administrateur trouvé pour créer les frais par défaut');
    }

    return this.prisma.platformFees.create({
      data: {
        percentage: 5.0,
        description: 'Frais de plateforme par défaut',
        createdBy: admin.id,
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}

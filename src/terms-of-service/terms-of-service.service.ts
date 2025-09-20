import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermsOfServiceDto } from './dto/create-terms-of-service.dto';
import { UpdateTermsOfServiceDto } from './dto/update-terms-of-service.dto';

@Injectable()
export class TermsOfServiceService {
  constructor(private prisma: PrismaService) {}

  async create(createTermsOfServiceDto: CreateTermsOfServiceDto) {
    // Désactiver toutes les autres versions
    await this.prisma.termsOfService.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Créer la nouvelle version
    return this.prisma.termsOfService.create({
      data: createTermsOfServiceDto,
    });
  }

  async findAll() {
    return this.prisma.termsOfService.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    const terms = await this.prisma.termsOfService.findFirst({
      where: { isActive: true },
    });

    if (!terms) {
      throw new NotFoundException('Aucune politique d\'utilisation active trouvée');
    }

    return terms;
  }

  async findOne(id: string) {
    const terms = await this.prisma.termsOfService.findUnique({
      where: { id },
    });

    if (!terms) {
      throw new NotFoundException('Politique d\'utilisation non trouvée');
    }

    return terms;
  }

  async update(id: string, updateTermsOfServiceDto: UpdateTermsOfServiceDto) {
    const terms = await this.prisma.termsOfService.findUnique({
      where: { id },
    });

    if (!terms) {
      throw new NotFoundException('Politique d\'utilisation non trouvée');
    }

    return this.prisma.termsOfService.update({
      where: { id },
      data: updateTermsOfServiceDto,
    });
  }

  async activate(id: string) {
    const terms = await this.prisma.termsOfService.findUnique({
      where: { id },
    });

    if (!terms) {
      throw new NotFoundException('Politique d\'utilisation non trouvée');
    }

    // Désactiver toutes les autres versions
    await this.prisma.termsOfService.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activer la version sélectionnée
    return this.prisma.termsOfService.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async remove(id: string) {
    const terms = await this.prisma.termsOfService.findUnique({
      where: { id },
    });

    if (!terms) {
      throw new NotFoundException('Politique d\'utilisation non trouvée');
    }

    if (terms.isActive) {
      throw new Error('Impossible de supprimer la politique d\'utilisation active');
    }

    return this.prisma.termsOfService.delete({
      where: { id },
    });
  }
}

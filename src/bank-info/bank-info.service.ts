import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankInfoDto } from './dto/create-bank-info.dto';
import { UpdateBankInfoDto } from './dto/update-bank-info.dto';

@Injectable()
export class BankInfoService {
  constructor(private prisma: PrismaService) {}

  async create(createBankInfoDto: CreateBankInfoDto, userId: string) {
    const { isDefault, ...bankInfoData } = createBankInfoDto;

    // Si c'est défini comme compte par défaut, désactiver les autres comptes par défaut
    if (isDefault) {
      await this.prisma.bankInfo.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    try {
      return await this.prisma.bankInfo.create({
        data: {
          ...bankInfoData,
          userId,
          isDefault: isDefault || false,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ces informations bancaires existent déjà');
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.bankInfo.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string) {
    const bankInfo = await this.prisma.bankInfo.findUnique({
      where: { id },
    });

    if (!bankInfo) {
      throw new NotFoundException('Information bancaire non trouvée');
    }

    if (bankInfo.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette information bancaire');
    }

    return bankInfo;
  }

  async update(id: string, updateBankInfoDto: UpdateBankInfoDto, userId: string) {
    const bankInfo = await this.prisma.bankInfo.findUnique({
      where: { id },
    });

    if (!bankInfo) {
      throw new NotFoundException('Information bancaire non trouvée');
    }

    if (bankInfo.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette information bancaire');
    }

    const { isDefault, ...bankInfoData } = updateBankInfoDto;

    // Si c'est défini comme compte par défaut, désactiver les autres comptes par défaut
    if (isDefault) {
      await this.prisma.bankInfo.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    try {
      return await this.prisma.bankInfo.update({
        where: { id },
        data: {
          ...bankInfoData,
          isDefault: isDefault !== undefined ? isDefault : bankInfo.isDefault,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ces informations bancaires existent déjà');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    const bankInfo = await this.prisma.bankInfo.findUnique({
      where: { id },
    });

    if (!bankInfo) {
      throw new NotFoundException('Information bancaire non trouvée');
    }

    if (bankInfo.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette information bancaire');
    }

    try {
      await this.prisma.bankInfo.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException('Impossible de supprimer cette information bancaire car elle est utilisée dans des demandes de retrait');
      }
      throw error;
    }
  }

  async setDefault(id: string, userId: string) {
    const bankInfo = await this.prisma.bankInfo.findUnique({
      where: { id },
    });

    if (!bankInfo) {
      throw new NotFoundException('Information bancaire non trouvée');
    }

    if (bankInfo.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette information bancaire');
    }

    // Désactiver tous les autres comptes par défaut
    await this.prisma.bankInfo.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Activer ce compte comme défaut
    return this.prisma.bankInfo.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
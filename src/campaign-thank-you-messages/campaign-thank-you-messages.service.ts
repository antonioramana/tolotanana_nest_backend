import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignThankYouMessageDto } from './dto/create-campaign-thank-you-message.dto';
import { UpdateCampaignThankYouMessageDto } from './dto/update-campaign-thank-you-message.dto';

@Injectable()
export class CampaignThankYouMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCampaignThankYouMessageDto, userId: string) {
    const { campaignId, message } = createDto;

    // Vérifier que la campagne existe et appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette campagne');
    }

    // Désactiver tous les autres messages actifs pour cette campagne
    await this.prisma.campaignThankYouMessage.updateMany({
      where: { 
        campaignId,
        isActive: true 
      },
      data: { isActive: false },
    });

    // Créer le nouveau message
    return this.prisma.campaignThankYouMessage.create({
      data: {
        campaignId,
        message,
        isActive: true,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAll(campaignId: string, userId: string) {
    // Vérifier que la campagne existe et appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à voir cette campagne');
    }

    return this.prisma.campaignThankYouMessage.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const message = await this.prisma.campaignThankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à voir ce message');
    }

    return message;
  }

  async update(id: string, updateDto: UpdateCampaignThankYouMessageDto, userId: string) {
    const message = await this.prisma.campaignThankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce message');
    }

    const { message: newMessage, isActive } = updateDto;

    // Si on active ce message, désactiver tous les autres
    if (isActive === true) {
      await this.prisma.campaignThankYouMessage.updateMany({
        where: { 
          campaignId: message.campaignId,
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false },
      });
    }

    return this.prisma.campaignThankYouMessage.update({
      where: { id },
      data: {
        message: newMessage,
        isActive: isActive !== undefined ? isActive : message.isActive,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.prisma.campaignThankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce message');
    }

    await this.prisma.campaignThankYouMessage.delete({
      where: { id },
    });

    return { message: 'Message de remerciement supprimé avec succès' };
  }

  async getActiveMessage(campaignId: string) {
    return this.prisma.campaignThankYouMessage.findFirst({
      where: { 
        campaignId,
        isActive: true 
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async setActive(id: string, userId: string) {
    const message = await this.prisma.campaignThankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce message');
    }

    // Désactiver tous les autres messages pour cette campagne
    await this.prisma.campaignThankYouMessage.updateMany({
      where: { 
        campaignId: message.campaignId,
        isActive: true 
      },
      data: { isActive: false },
    });

    // Activer ce message
    return this.prisma.campaignThankYouMessage.update({
      where: { id },
      data: { isActive: true },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}






















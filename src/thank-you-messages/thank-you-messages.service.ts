import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThankYouMessageDto } from './dto/create-thank-you-message.dto';
import { UpdateThankYouMessageDto } from './dto/update-thank-you-message.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ThankYouMessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createThankYouMessageDto: CreateThankYouMessageDto, userId: string) {
    const { campaignId, donationId, message } = createThankYouMessageDto;

    // Vérifier que la campagne appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez envoyer des messages de remerciement que pour vos propres campagnes');
    }

    // Vérifier que la donation existe et appartient à cette campagne
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!donation) {
      throw new NotFoundException('Donation non trouvée');
    }

    if (donation.campaignId !== campaignId) {
      throw new ForbiddenException('Cette donation n\'appartient pas à cette campagne');
    }

    // Vérifier qu'il n'y a pas déjà un message de remerciement pour cette donation
    const existingMessage = await this.prisma.thankYouMessage.findFirst({
      where: {
        campaignId,
        donationId,
      },
    });

    if (existingMessage) {
      throw new ForbiddenException('Un message de remerciement a déjà été envoyé pour cette donation');
    }

    return this.prisma.thankYouMessage.create({
      data: {
        campaignId,
        donationId,
        message,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        donation: {
          select: {
            id: true,
            amount: true,
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(campaignId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Vérifier que la campagne existe
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    const [messages, total] = await Promise.all([
      this.prisma.thankYouMessage.findMany({
        where: { campaignId },
        include: {
          donation: {
            select: {
              id: true,
              amount: true,
              donor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.thankYouMessage.count({
        where: { campaignId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages,
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

  async findOne(id: string) {
    const message = await this.prisma.thankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        donation: {
          select: {
            id: true,
            amount: true,
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    return message;
  }

  async update(id: string, updateThankYouMessageDto: UpdateThankYouMessageDto, userId: string) {
    const message = await this.prisma.thankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que les messages de vos propres campagnes');
    }

    return this.prisma.thankYouMessage.update({
      where: { id },
      data: updateThankYouMessageDto,
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        donation: {
          select: {
            id: true,
            amount: true,
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.prisma.thankYouMessage.findUnique({
      where: { id },
      include: {
        campaign: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message de remerciement non trouvé');
    }

    if (message.campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que les messages de vos propres campagnes');
    }

    await this.prisma.thankYouMessage.delete({
      where: { id },
    });
  }

  async getCampaignThankYouMessages(campaignId: string, userId: string, pagination: PaginationDto) {
    // Vérifier que la campagne appartient à l'utilisateur
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez voir que les messages de vos propres campagnes');
    }

    return this.findAll(campaignId, pagination);
  }
}
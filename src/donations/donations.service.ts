import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationFilterDto } from './dto/donation-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ThankYouMessagesService } from '../thank-you-messages/thank-you-messages.service';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    private thankYouMessagesService: ThankYouMessagesService,
  ) {}

  async create(createDonationDto: CreateDonationDto, donorId?: string) {
    const { campaignId, amount, message, isAnonymous, paymentMethod, donorName } = createDonationDto;

    // Vérifier que la campagne existe et est active
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvée');
    }

    if (campaign.status !== 'active') {
      throw new BadRequestException('Cette campagne n\'accepte plus de dons');
    }

    if (new Date(campaign.deadline) < new Date()) {
      throw new BadRequestException('Cette campagne est expirée');
    }

    // Calculer les frais de plateforme (exemple: 5%)
    const platformFee = Number(amount) * 0.05;
    const netAmount = Number(amount) - platformFee;

    // Créer la donation
    const donation = await this.prisma.donation.create({
      data: {
        campaignId,
        donorId: isAnonymous ? null : donorId || null,
        donorName: isAnonymous ? null : (donorName || null),
        amount,
        message,
        isAnonymous,
        paymentMethod,
        status: 'pending',
      },
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
                email: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Ne pas incrémenter les montants tant que le don n'est pas validé (pending)

    return donation;
  }

  async findAll(filters: DonationFilterDto, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters.donorId) {
      where.donorId = filters.donorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.minAmount) {
      where.amount = { gte: filters.minAmount };
    }

    if (filters.maxAmount) {
      where.amount = { ...where.amount, lte: filters.maxAmount };
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.isAnonymous !== undefined) {
      where.isAnonymous = filters.isAnonymous;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sortBy === 'amount') {
      orderBy = { amount: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'createdAt') {
      orderBy = { createdAt: filters.sortOrder || 'desc' };
    }

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.donation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: donations,
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
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            images: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        thankYouMessages: true,
      },
    });

    if (!donation) {
      throw new NotFoundException('Don non trouvé');
    }

    return donation;
  }

  async update(id: string, updateDonationDto: UpdateDonationDto) {
    try {
      // Récupérer la donation actuelle pour vérifier le statut précédent
      const currentDonation = await this.prisma.donation.findUnique({
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
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!currentDonation) {
        throw new NotFoundException('Don non trouvé');
      }

      const donation = await this.prisma.donation.update({
        where: { id },
        data: updateDonationDto,
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
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Mettre à jour le montant collecté de la campagne si le statut passe à "completed"
      if (updateDonationDto.status === 'completed' && currentDonation.status !== 'completed') {
        try {
          // Incrémenter le montant collecté de la campagne
          await this.prisma.campaign.update({
            where: { id: currentDonation.campaignId },
            data: {
              currentAmount: {
                increment: Number(currentDonation.amount),
              },
            },
          });

          console.log(`Montant collecté mis à jour pour la campagne ${currentDonation.campaignId}: +${currentDonation.amount} Ar`);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du montant collecté:', error);
          // Ne pas faire échouer la mise à jour de la donation si la mise à jour du montant échoue
        }

        // Envoyer automatiquement un message de remerciement
        try {
          await this.sendAutomaticThankYouMessage(donation);
        } catch (error) {
          console.error('Erreur lors de l\'envoi automatique du message de remerciement:', error);
          // Ne pas faire échouer la mise à jour de la donation si l'envoi du message échoue
        }
      }

      // Gérer le cas où un don "completed" est annulé (passe à "failed" ou "pending")
      if (updateDonationDto.status !== 'completed' && currentDonation.status === 'completed') {
        try {
          // Décrémenter le montant collecté de la campagne
          await this.prisma.campaign.update({
            where: { id: currentDonation.campaignId },
            data: {
              currentAmount: {
                decrement: Number(currentDonation.amount),
              },
            },
          });

          console.log(`Montant collecté mis à jour pour la campagne ${currentDonation.campaignId}: -${currentDonation.amount} Ar (don annulé)`);
        } catch (error) {
          console.error('Erreur lors de la mise à jour du montant collecté (annulation):', error);
          // Ne pas faire échouer la mise à jour de la donation si la mise à jour du montant échoue
        }
      }

      return donation;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Don non trouvé');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.donation.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Don non trouvé');
      }
      throw error;
    }
  }

  async getUserDonations(userId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: { donorId: userId },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              images: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.donation.count({
        where: { donorId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: donations,
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

  async getDonationStats() {
    const [totalDonations, totalAmount, avgDonation] = await Promise.all([
      this.prisma.donation.count({
        where: { status: 'completed' },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'completed' },
        _avg: { amount: true },
      }),
    ]);

    return {
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      averageDonation: avgDonation._avg.amount || 0,
    };
  }

  private async sendAutomaticThankYouMessage(donation: any) {
    try {
      // Vérifier qu'il n'y a pas déjà un message de remerciement pour cette donation
      const existingMessage = await this.prisma.thankYouMessage.findFirst({
        where: {
          campaignId: donation.campaignId,
          donationId: donation.id,
        },
      });

      if (existingMessage) {
        console.log('Message de remerciement déjà envoyé pour cette donation');
        return;
      }

      // Créer un message de remerciement automatique
      const donorName = donation.donor 
        ? `${donation.donor.firstName} ${donation.donor.lastName}`.trim()
        : donation.donorName || 'Cher donateur';

      const campaignTitle = donation.campaign.title;
      const amount = donation.amount;

      const thankYouMessage = `Merci ${donorName} pour votre généreux don de ${amount} Ar pour la campagne "${campaignTitle}" ! Votre soutien nous aide énormément à atteindre notre objectif. 🙏`;

      // Créer le message de remerciement
      await this.thankYouMessagesService.create({
        campaignId: donation.campaignId,
        donationId: donation.id,
        message: thankYouMessage,
      }, donation.campaign.creator.id);

      console.log(`Message de remerciement automatique envoyé pour la donation ${donation.id}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi automatique du message de remerciement:', error);
      throw error;
    }
  }
}
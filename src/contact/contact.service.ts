import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ReplyContactMessageDto } from './dto/reply-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createDto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({
      data: createDto,
    });

    // Envoyer email de confirmation à l'utilisateur
    try {
      await this.emailService.sendContactConfirmation(
        createDto.email,
        createDto.name,
        createDto.subject,
        createDto.message,
      );
    } catch (error) {
      console.error('Erreur envoi email de confirmation:', error);
      // Ne pas faire échouer la création du message si l'email échoue
    }

    // Attendre 5 secondes avant d'envoyer la notification admin (limite Mailtrap stricte)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Envoyer notification à l'admin (peut être désactivé via variable d'environnement)
    const sendAdminNotifications = process.env.SEND_ADMIN_NOTIFICATIONS !== 'false';
    
    if (sendAdminNotifications) {
      try {
        await this.emailService.sendAdminNotification(
          createDto.name,
          createDto.email,
          createDto.subject,
          createDto.message,
        );
      } catch (error) {
        console.error('Erreur envoi notification admin:', error);
        console.log('💡 Conseil: Ajoutez SEND_ADMIN_NOTIFICATIONS=false dans .env pour désactiver temporairement');
        // Ne pas faire échouer la création du message si l'email échoue
      }
    } else {
      console.log('ℹ️ Notifications admin désactivées (SEND_ADMIN_NOTIFICATIONS=false)');
    }

    return message;
  }

  async findAll(page: number = 1, limit: number = 10, filter?: 'unread' | 'replied' | 'all') {
    const skip = (page - 1) * limit;
    
    let where = {};
    if (filter === 'unread') {
      where = { isRead: false };
    } else if (filter === 'replied') {
      where = { isReplied: true };
    }

    const [messages, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          replier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        replier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message de contact non trouvé');
    }

    return message;
  }

  async markAsRead(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message de contact non trouvé');
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
      include: {
        replier: {
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

  async reply(id: string, replyDto: ReplyContactMessageDto, adminId: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message de contact non trouvé');
    }

    const updatedMessage = await this.prisma.contactMessage.update({
      where: { id },
      data: {
        reply: replyDto.reply,
        isReplied: true,
        isRead: true, // Marquer comme lu quand on répond
        repliedBy: adminId,
        repliedAt: new Date(),
      },
      include: {
        replier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Envoyer la réponse par email à l'utilisateur
    try {
      await this.emailService.sendContactReply(
        message.email,
        message.name,
        message.subject,
        message.message,
        replyDto.reply,
      );
    } catch (error) {
      console.error('Erreur envoi email de réponse:', error);
      // Ne pas faire échouer la réponse si l'email échoue
    }

    return updatedMessage;
  }

  async delete(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message de contact non trouvé');
    }

    await this.prisma.contactMessage.delete({
      where: { id },
    });

    return { message: 'Message de contact supprimé avec succès' };
  }

  async getStats() {
    const [total, unread, replied] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.contactMessage.count({ where: { isReplied: true } }),
    ]);

    return {
      total,
      unread,
      replied,
      pending: total - replied,
    };
  }
}

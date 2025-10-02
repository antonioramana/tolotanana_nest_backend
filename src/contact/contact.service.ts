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
    // 1. Créer le message immédiatement
    const message = await this.prisma.contactMessage.create({
      data: createDto,
    });

    // 2. Lancer l'envoi des emails en arrière-plan (asynchrone)
    this.sendEmailsInBackground(createDto, message.id);

    // 3. Retourner immédiatement la réponse au frontend (< 3 secondes)
    return {
      ...message,
      emailStatus: 'en_cours',
      message: 'Message enregistré. Les emails de confirmation sont en cours d\'envoi.'
    };
  }

  private sendEmailsInBackground(createDto: CreateContactMessageDto, messageId: string) {
    // Exécuter de manière asynchrone sans bloquer la réponse
    setImmediate(async () => {
      console.log(`📧 Début envoi emails en arrière-plan pour message ${messageId}`);
      
      // Envoyer email de confirmation à l'utilisateur
      await this.sendConfirmationEmailWithRetry(createDto, messageId);
      
      // Attendre un délai avant d'envoyer la notification admin
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Envoyer notification à l'admin si activée
      await this.sendAdminNotificationWithRetry(createDto, messageId);
      
      console.log(`✅ Envoi emails terminé pour message ${messageId}`);
    });
  }

  private async sendConfirmationEmailWithRetry(createDto: CreateContactMessageDto, messageId: string) {
    const maxAttempts = 5; // Plus d'essais car on a le temps
    let attempt = 1;

    while (attempt <= maxAttempts) {
      try {
        console.log(`📧 Tentative ${attempt}/${maxAttempts} - Email confirmation pour ${createDto.email}`);
        
        await this.emailService.sendContactConfirmation(
          createDto.email,
          createDto.name,
          createDto.subject,
          createDto.message,
        );
        
        console.log(`✅ Email confirmation envoyé avec succès (tentative ${attempt})`);
        
        // Mettre à jour le statut en base si nécessaire
        await this.updateEmailStatus(messageId, 'confirmation_sent');
        return;
        
      } catch (error) {
        console.error(`❌ Tentative ${attempt}/${maxAttempts} échouée:`, (error as any)?.message || 'Erreur inconnue');
        
        if (attempt < maxAttempts) {
          const waitTime = attempt * 5000; // 5s, 10s, 15s, 20s
          console.log(`⏳ Attente ${waitTime}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        attempt++;
      }
    }
    
    console.error(`💥 Échec définitif envoi email confirmation après ${maxAttempts} tentatives`);
  }

  private async sendAdminNotificationWithRetry(createDto: CreateContactMessageDto, messageId: string) {
    const sendAdminNotifications = process.env.SEND_ADMIN_NOTIFICATIONS !== 'false';
    
    if (!sendAdminNotifications) {
      console.log('ℹ️ Notifications admin désactivées (SEND_ADMIN_NOTIFICATIONS=false)');
      return;
    }

    const maxAttempts = 5;
    let attempt = 1;

    while (attempt <= maxAttempts) {
      try {
        console.log(`📧 Tentative ${attempt}/${maxAttempts} - Notification admin`);
        
        await this.emailService.sendAdminNotification(
          createDto.name,
          createDto.email,
          createDto.subject,
          createDto.message,
        );
        
        console.log(`✅ Notification admin envoyée avec succès (tentative ${attempt})`);
        
        // Mettre à jour le statut en base
        await this.updateEmailStatus(messageId, 'admin_notified');
        return;
        
      } catch (error) {
        console.error(`❌ Tentative ${attempt}/${maxAttempts} échouée (admin):`, (error as any)?.message || 'Erreur inconnue');
        
        if (attempt < maxAttempts) {
          const waitTime = attempt * 5000; // 5s, 10s, 15s, 20s
          console.log(`⏳ Attente ${waitTime}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        attempt++;
      }
    }
    
    console.error(`💥 Échec définitif notification admin après ${maxAttempts} tentatives`);
  }

  private async updateEmailStatus(messageId: string, status: string) {
    try {
      // Optionnel: ajouter un champ emailStatus dans votre base de données
      // Pour l'instant, on log juste le statut
      console.log(`📊 Statut email pour message ${messageId}: ${status}`);
    } catch (error) {
      console.error('Erreur mise à jour statut email:', error);
    }
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

    // Envoyer la réponse par email en arrière-plan
    this.sendReplyEmailInBackground(message, replyDto.reply);

    return {
      ...updatedMessage,
      emailStatus: 'en_cours',
      message: 'Réponse enregistrée. L\'email de réponse est en cours d\'envoi.'
    };
  }

  private sendReplyEmailInBackground(originalMessage: any, replyContent: string) {
    setImmediate(async () => {
      console.log(`📧 Début envoi réponse email en arrière-plan pour message ${originalMessage.id}`);
      
      const maxAttempts = 5;
      let attempt = 1;

      while (attempt <= maxAttempts) {
        try {
          console.log(`📧 Tentative ${attempt}/${maxAttempts} - Email réponse pour ${originalMessage.email}`);
          
          await this.emailService.sendContactReply(
            originalMessage.email,
            originalMessage.name,
            originalMessage.subject,
            originalMessage.message,
            replyContent,
          );
          
          console.log(`✅ Email réponse envoyé avec succès (tentative ${attempt})`);
          await this.updateEmailStatus(originalMessage.id, 'reply_sent');
          return;
          
        } catch (error) {
          console.error(`❌ Tentative ${attempt}/${maxAttempts} échouée (réponse):`, (error as any)?.message || 'Erreur inconnue');
          
          if (attempt < maxAttempts) {
            const waitTime = attempt * 5000; // 5s, 10s, 15s, 20s
            console.log(`⏳ Attente ${waitTime}ms avant nouvelle tentative...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          
          attempt++;
        }
      }
      
      console.error(`💥 Échec définitif envoi email réponse après ${maxAttempts} tentatives`);
    });
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

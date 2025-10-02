import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private lastEmailTime = 0;
  private readonly minDelayBetweenEmails = 3000; // 3 secondes minimum entre les emails (Mailtrap strict)

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    // Configuration pour Mailtrap
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io'),
      port: this.configService.get<number>('MAILTRAP_PORT', 2525),
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),
        pass: this.configService.get<string>('MAILTRAP_PASSWORD'),
      },
    });

    // Vérifier la connexion
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Erreur de configuration email:', error);
      } else {
        this.logger.log('Serveur email prêt à envoyer des messages');
      }
    });
  }

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastEmail = now - this.lastEmailTime;
    
    if (timeSinceLastEmail < this.minDelayBetweenEmails) {
      const waitTime = this.minDelayBetweenEmails - timeSinceLastEmail;
      this.logger.log(`Attente de ${waitTime}ms pour respecter les limites de débit`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastEmailTime = Date.now();
  }

  async sendContactReply(
    userEmail: string,
    userName: string,
    originalSubject: string,
    originalMessage: string,
    adminReply: string,
  ) {
    const mailOptions = {
      from: {
        name: 'TOLOTANANA Support',
        address: this.configService.get<string>('EMAIL_FROM', 'support@tolotanana.com'),
      },
      to: userEmail,
      subject: `Re: ${originalSubject}`,
      html: this.getReplyEmailTemplate(userName, originalSubject, originalMessage, adminReply),
    };

    try {
      await this.waitForRateLimit();
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de réponse envoyé à ${userEmail}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${userEmail}:`, error);
      throw error;
    }
  }

  async sendContactConfirmation(
    userEmail: string,
    userName: string,
    subject: string,
    message: string,
  ) {
    const mailOptions = {
      from: {
        name: 'TOLOTANANA Support',
        address: this.configService.get<string>('EMAIL_FROM', 'support@tolotanana.com'),
      },
      to: userEmail,
      subject: 'Confirmation de réception - TOLOTANANA',
      html: this.getConfirmationEmailTemplate(userName, subject, message),
    };

    try {
      await this.waitForRateLimit();
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmation envoyé à ${userEmail}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi confirmation à ${userEmail}:`, error);
      throw error;
    }
  }

  async sendAdminNotification(
    userName: string,
    userEmail: string,
    subject: string,
    message: string,
  ) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) return;

    const mailOptions = {
      from: {
        name: 'TOLOTANANA System',
        address: this.configService.get<string>('EMAIL_FROM', 'support@tolotanana.com'),
      },
      to: adminEmail,
      subject: `Nouveau message de contact - ${subject}`,
      html: this.getAdminNotificationTemplate(userName, userEmail, subject, message),
    };

    try {
      await this.waitForRateLimit();
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Notification admin envoyée`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi notification admin:`, error);
      throw error;
    }
  }

  private getReplyEmailTemplate(
    userName: string,
    originalSubject: string,
    originalMessage: string,
    adminReply: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .reply { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
          .original { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TOLOTANANA</h1>
            <p>Réponse à votre message de contact</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${userName}</strong>,</p>
            
            <p>Nous avons bien reçu votre message et voici notre réponse :</p>
            
            <div class="reply">
              <h3>💬 Notre réponse :</h3>
              <p>${adminReply.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div class="original">
              <h4>📝 Votre message original :</h4>
              <p><strong>Sujet :</strong> ${originalSubject}</p>
              <p><strong>Message :</strong><br>${originalMessage.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>Si vous avez d'autres questions, n'hésitez pas à nous recontacter via notre formulaire de contact sur le site.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe TOLOTANANA</strong></p>
          </div>
          
          <div class="footer">
            <p>TOLOTANANA - Plateforme de collecte de fonds solidaire</p>
            <p>📧 contact@tolotanana.com | 🌐 www.tolotanana.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getConfirmationEmailTemplate(
    userName: string,
    subject: string,
    message: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TOLOTANANA</h1>
            <p>Confirmation de réception</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${userName}</strong>,</p>
            
            <p>✅ Nous avons bien reçu votre message de contact. Voici un récapitulatif :</p>
            
            <div class="message-box">
              <p><strong>📝 Sujet :</strong> ${subject}</p>
              <p><strong>💬 Message :</strong><br>${message.replace(/\n/g, '<br>')}</p>
              <p><strong>📅 Reçu le :</strong> ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <p><strong>⏰ Délai de réponse :</strong> Nous nous efforçons de répondre à tous les messages dans les 24-48 heures pendant les jours ouvrables.</p>
            
            <p>Merci de nous avoir contactés !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe TOLOTANANA</strong></p>
          </div>
          
          <div class="footer">
            <p>TOLOTANANA - Plateforme de collecte de fonds solidaire</p>
            <p>📧 contact@tolotanana.com | 🌐 www.tolotanana.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getAdminNotificationTemplate(
    userName: string,
    userEmail: string,
    subject: string,
    message: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 15px 0; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 NOUVEAU MESSAGE</h1>
            <p>Notification Admin - TOLOTANANA</p>
          </div>
          
          <div class="content">
            <p><strong>Un nouveau message de contact a été reçu :</strong></p>
            
            <div class="message-box">
              <p><strong>👤 De :</strong> ${userName}</p>
              <p><strong>📧 Email :</strong> ${userEmail}</p>
              <p><strong>📝 Sujet :</strong> ${subject}</p>
              <p><strong>💬 Message :</strong><br>${message.replace(/\n/g, '<br>')}</p>
              <p><strong>📅 Reçu le :</strong> ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <p><strong>🔗 Action requise :</strong> Connectez-vous à l'interface admin pour répondre à ce message.</p>
          </div>
          
          <div class="footer">
            <p>TOLOTANANA - Système de notification automatique</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 3000; // Délai minimum entre les emails (ajusté selon le provider)

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const useGmail = nodeEnv === 'production' || this.configService.get<string>('EMAIL_PROVIDER') === 'gmail';

    if (useGmail) {
      // Configuration Gmail pour production
      this.logger.log('📧 Configuration Gmail SMTP (Production)');
      const gmailPort = this.configService.get<number>('EMAIL_PORT', 587);
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Utilise la configuration prédéfinie de Gmail
        host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
        port: gmailPort,
        secure: gmailPort === 465, // true pour port 465, false pour port 587
        requireTLS: true, // Force l'utilisation de TLS
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASSWORD'),
        },
        tls: {
          // Configuration TLS pour Gmail
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        // Timeout settings
        connectionTimeout: 60000, // 60 secondes
        greetingTimeout: 30000,   // 30 secondes
        socketTimeout: 75000      // 75 secondes
      });
      
      // Ajuster les délais pour Gmail (moins strict que Mailtrap)
      this.minDelayBetweenEmails = this.configService.get<number>('MIN_EMAIL_DELAY', 1000); // 1 seconde pour Gmail
    } else {
      // Configuration Mailtrap pour développement
      this.logger.log('📧 Configuration Mailtrap SMTP (Développement)');
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io'),
        port: this.configService.get<number>('MAILTRAP_PORT', 2525),
        auth: {
          user: this.configService.get<string>('MAILTRAP_USER'),
          pass: this.configService.get<string>('MAILTRAP_PASSWORD'),
        },
      });
      
      // Garder les délais stricts pour Mailtrap
      this.minDelayBetweenEmails = this.configService.get<number>('MIN_EMAIL_DELAY', 3000); // 3 secondes pour Mailtrap
    }

    // Vérifier la connexion
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error(`❌ Erreur de configuration email (${useGmail ? 'Gmail' : 'Mailtrap'}):`, error.message);
        
        // Aide au diagnostic selon le type d'erreur
        if (useGmail) {
          if (error.message.includes('SSL') || error.message.includes('TLS')) {
            this.logger.error('💡 Conseil: Vérifiez la configuration SSL/TLS de Gmail');
            this.logger.error('   - Port 587 avec STARTTLS (secure: false)');
            this.logger.error('   - Port 465 avec SSL (secure: true)');
          } else if (error.message.includes('authentication') || error.message.includes('login')) {
            this.logger.error('💡 Conseil: Vérifiez vos credentials Gmail');
            this.logger.error('   - EMAIL_USER: votre email Gmail');
            this.logger.error('   - EMAIL_PASSWORD: mot de passe d\'application Gmail (pas votre mot de passe normal)');
          } else if (error.message.includes('timeout') || error.message.includes('connection')) {
            this.logger.error('💡 Conseil: Problème de réseau ou firewall');
          }
        }
      } else {
        this.logger.log(`✅ Serveur email prêt (${useGmail ? 'Gmail' : 'Mailtrap'}) - Délai: ${this.minDelayBetweenEmails}ms`);
        
        if (useGmail) {
          this.logger.log(`📧 Configuration Gmail: ${this.configService.get<string>('EMAIL_USER')} via port ${this.configService.get<number>('EMAIL_PORT', 587)}`);
        }
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

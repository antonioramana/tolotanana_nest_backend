import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private lastEmailTime = 0;
  private minDelayBetweenEmails = 3000; // Délai minimum entre les emails (ajusté selon le provider)

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const useGmail = nodeEnv === 'production' || this.configService.get<string>('EMAIL_PROVIDER') === 'gmail';

    if (useGmail) {
      this.createGmailTransporter();
    } else {
      this.createMailtrapTransporter();
    }
  }

  private createGmailTransporter() {
    this.logger.log('📧 Configuration Gmail SMTP (Production)');
    
    // Essayer différentes configurations Gmail selon l'environnement
    const gmailConfigs = this.getGmailConfigurations();
    
    // Utiliser la première configuration (la plus robuste pour Render/production)
    const config = gmailConfigs[0];
    this.logger.log(`🔧 Utilisation configuration Gmail: Port ${config.port}, Pool: ${config.pool}`);
    
    this.transporter = nodemailer.createTransport(config);
    
    // Ajuster les délais pour Gmail (moins strict que Mailtrap)
    this.minDelayBetweenEmails = this.configService.get<number>('MIN_EMAIL_DELAY', 1000);
    
    this.verifyConnection('Gmail');
  }

  private getGmailConfigurations() {
    const baseAuth = {
      user: this.configService.get<string>('EMAIL_USER'),
      pass: this.configService.get<string>('EMAIL_PASSWORD'),
    };

    const baseTls = {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
      minVersion: 'TLSv1.2'
    };

    // Configuration 1: Sans pool, timeouts très longs (pour Render/production restrictive)
    const config1 = {
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false,
      requireTLS: true,
      auth: baseAuth,
      tls: baseTls,
      pool: false, // Désactiver le pooling pour éviter les problèmes de connexion
      connectionTimeout: 120000, // 2 minutes
      greetingTimeout: 60000,    // 1 minute
      socketTimeout: 90000,      // 1.5 minute
      maxConnections: 1,
      maxMessages: 1,
    };

    // Configuration 2: Port 465 avec SSL direct
    const config2 = {
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: 465,
      secure: true,
      auth: baseAuth,
      tls: baseTls,
      pool: false,
      connectionTimeout: 120000,
      greetingTimeout: 60000,
      socketTimeout: 90000,
      maxConnections: 1,
      maxMessages: 1,
    };

    // Configuration 3: Configuration minimale (fallback)
    const config3 = {
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false,
      auth: baseAuth,
      pool: false,
      connectionTimeout: 180000, // 3 minutes
      socketTimeout: 120000,     // 2 minutes
    };

    return [config1, config2, config3];
  }

  private createMailtrapTransporter() {
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
    this.minDelayBetweenEmails = this.configService.get<number>('MIN_EMAIL_DELAY', 3000);
    
    this.verifyConnection('Mailtrap');
  }

  private verifyConnection(providerName: string) {
    // Timeout plus long pour la vérification initiale
    const verifyTimeout = providerName === 'Gmail' ? 45000 : 15000; // 45s pour Gmail, 15s pour Mailtrap
    
    const verifyPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Verification timeout'));
      }, verifyTimeout);
      
      this.transporter.verify((error, success) => {
        clearTimeout(timer);
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    verifyPromise
      .then(() => {
        this.logger.log(`✅ Serveur email prêt (${providerName}) - Délai: ${this.minDelayBetweenEmails}ms`);
        if (providerName === 'Gmail') {
          this.logger.log(`📧 Configuration Gmail: ${this.configService.get<string>('EMAIL_USER')} via port ${this.configService.get<number>('EMAIL_PORT', 587)}`);
        }
      })
      .catch((error) => {
        if (providerName === 'Gmail' && (error.message.includes('timeout') || error.message.includes('connection'))) {
          // En production, on continue même si la vérification échoue
          this.logger.warn(`⚠️ Vérification email échouée mais service actif (${providerName}): ${error.message}`);
          this.logger.warn('🔧 Le service email fonctionnera probablement malgré cette erreur de vérification');
        } else {
          this.logger.error(`❌ Erreur de configuration email (${providerName}):`, error.message);
          
          // Aide au diagnostic selon le type d'erreur
          if (providerName === 'Gmail') {
            if (error.message.includes('SSL') || error.message.includes('TLS')) {
              this.logger.error('💡 Conseil: Vérifiez la configuration SSL/TLS de Gmail');
              this.logger.error('   - Port 587 avec STARTTLS (secure: false)');
              this.logger.error('   - Port 465 avec SSL (secure: true)');
            } else if (error.message.includes('authentication') || error.message.includes('login')) {
              this.logger.error('💡 Conseil: Vérifiez vos credentials Gmail');
              this.logger.error('   - EMAIL_USER: votre email Gmail');
              this.logger.error('   - EMAIL_PASSWORD: mot de passe d\'application Gmail (pas votre mot de passe normal)');
            } else if (error.message.includes('timeout') || error.message.includes('connection')) {
              this.logger.error('💡 Conseil: Problème de réseau ou firewall - Service actif malgré l\'erreur');
            }
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

  private async sendMailWithRetry(mailOptions: any, maxRetries: number = 3): Promise<any> {
    let lastError;
    
    // Essayer d'abord SMTP traditionnel
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit();
        const result = await this.transporter.sendMail(mailOptions);
        if (attempt > 1) {
          this.logger.log(`✅ Email envoyé avec succès via SMTP après ${attempt} tentatives`);
        }
        return result;
      } catch (error) {
        lastError = error;
        
        const errorCode = (error as any)?.code;
        const errorMessage = (error as any)?.message || 'Unknown error';
        
        if (errorCode === 'ETIMEDOUT' || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          this.logger.warn(`⚠️ Tentative SMTP ${attempt}/${maxRetries} échouée (timeout): ${errorMessage}`);
          
          if (attempt < maxRetries) {
            // Essayer une configuration alternative de Gmail si disponible
            if (attempt === 2 && this.isGmailEnvironment()) {
              this.logger.log('🔄 Tentative avec configuration Gmail alternative (port 465)...');
              await this.tryAlternativeGmailConfig();
            }
            
            const retryDelay = attempt * 3000; // Délai progressif plus long: 3s, 6s, 9s
            this.logger.log(`🔄 Nouvelle tentative dans ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        } else {
          // Pour les autres erreurs (auth, etc.), on ne retry pas
          throw error;
        }
      }
    }
    
    // Si SMTP a complètement échoué, essayer les méthodes alternatives
    this.logger.warn('❌ SMTP a échoué après toutes les tentatives. Essai des méthodes alternatives...');
    
    try {
      // Méthode 1: Essayer SendGrid/Mailgun API
      return await this.sendViaHttpApi(mailOptions);
    } catch (httpError) {
      this.logger.warn('❌ API HTTP a également échoué');
      
      try {
        // Méthode 2: Webhook de notification externe
        return await this.sendViaWebhook(mailOptions);
      } catch (webhookError) {
        this.logger.warn('❌ Webhook a également échoué');
        
        // Méthode 3: Mode dégradé - log pour traitement manuel
        return await this.logForManualProcessing(mailOptions, lastError);
      }
    }
  }

  private isGmailEnvironment(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    return nodeEnv === 'production' || this.configService.get<string>('EMAIL_PROVIDER') === 'gmail';
  }

  private async tryAlternativeGmailConfig(): Promise<void> {
    try {
      const gmailConfigs = this.getGmailConfigurations();
      // Utiliser la configuration 2 (port 465)
      const alternativeConfig = gmailConfigs[1];
      this.logger.log(`🔧 Basculement vers port ${alternativeConfig.port} avec SSL direct`);
      this.transporter = nodemailer.createTransport(alternativeConfig);
    } catch (error) {
      this.logger.warn('⚠️ Impossible de basculer vers la configuration alternative');
    }
  }

  private async sendViaHttpApi(mailOptions: any): Promise<any> {
    this.logger.log('🌐 Tentative d\'envoi via API HTTP...');
    
    // Essayer d'abord avec un service simple (peut être configuré avec WEBHOOK_EMAIL_URL)
    const webhookUrl = this.configService.get<string>('WEBHOOK_EMAIL_URL');
    if (webhookUrl) {
      try {
        const payload = {
          to: mailOptions.to,
          from: typeof mailOptions.from === 'object' ? mailOptions.from.address : mailOptions.from,
          subject: mailOptions.subject,
          html: mailOptions.html,
          timestamp: new Date().toISOString(),
          service: 'tolotanana-contact'
        };

        const response = await firstValueFrom(
          this.httpService.post(webhookUrl, payload, {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Tolotanana-EmailService/1.0'
            },
            timeout: 10000
          })
        );

        this.logger.log('✅ Email envoyé avec succès via API HTTP');
        return { messageId: 'http-api-' + Date.now(), response: (response as any).data };
      } catch (error) {
        this.logger.warn('❌ Échec envoi via API HTTP:', (error as any)?.message);
        throw error;
      }
    }

    // Si pas de webhook configuré, essayer EmailJS (service gratuit)
    return await this.sendViaEmailJS(mailOptions);
  }

  private async sendViaEmailJS(mailOptions: any): Promise<any> {
    const emailJsServiceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
    const emailJsTemplateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
    const emailJsUserId = this.configService.get<string>('EMAILJS_USER_ID');

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsUserId) {
      throw new Error('EmailJS non configuré');
    }

    try {
      const payload = {
        service_id: emailJsServiceId,
        template_id: emailJsTemplateId,
        user_id: emailJsUserId,
        template_params: {
          to_email: mailOptions.to,
          from_name: 'TOLOTANANA',
          subject: mailOptions.subject,
          message_html: mailOptions.html,
        }
      };

      const response = await firstValueFrom(
        this.httpService.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        })
      );

      this.logger.log('✅ Email envoyé avec succès via EmailJS');
      return { messageId: 'emailjs-' + Date.now(), response: (response as any).data };
    } catch (error) {
      this.logger.warn('❌ Échec envoi via EmailJS:', (error as any)?.message);
      throw error;
    }
  }

  private async sendViaWebhook(mailOptions: any): Promise<any> {
    this.logger.log('🪝 Tentative d\'envoi via webhook externe...');
    
    const webhookUrl = this.configService.get<string>('FALLBACK_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('Pas de webhook de fallback configuré');
    }

    try {
      const payload = {
        type: 'email_failed',
        email: {
          to: mailOptions.to,
          from: typeof mailOptions.from === 'object' ? mailOptions.from.address : mailOptions.from,
          subject: mailOptions.subject,
          html: mailOptions.html,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          service: 'tolotanana',
          reason: 'smtp_timeout'
        }
      };

      const response = await firstValueFrom(
        this.httpService.post(webhookUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        })
      );

      this.logger.log('✅ Notification webhook envoyée avec succès');
      return { messageId: 'webhook-' + Date.now(), response: (response as any).data };
    } catch (error) {
      this.logger.warn('❌ Échec envoi webhook:', (error as any)?.message);
      throw error;
    }
  }

  private async logForManualProcessing(mailOptions: any, originalError: any): Promise<any> {
    this.logger.error('📝 Mode dégradé: Email enregistré pour traitement manuel');
    
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: mailOptions.to,
      from: typeof mailOptions.from === 'object' ? mailOptions.from.address : mailOptions.from,
      subject: mailOptions.subject,
      html: mailOptions.html,
      originalError: (originalError as any)?.message || 'Unknown error',
      status: 'pending_manual_processing'
    };

    // Log détaillé pour que l'admin puisse traiter manuellement
    this.logger.error('📧 EMAIL NÉCESSITANT TRAITEMENT MANUEL:');
    this.logger.error('   Destinataire:', emailLog.to);
    this.logger.error('   Sujet:', emailLog.subject);
    this.logger.error('   Erreur:', emailLog.originalError);
    this.logger.error('   ⚠️ Cet email devra être envoyé manuellement');

    // Optionnel: Sauvegarder dans un fichier ou une base de données
    // await this.saveFailedEmail(emailLog);

    return { 
      messageId: 'manual-' + Date.now(), 
      status: 'logged_for_manual_processing',
      details: emailLog 
    };
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
      const result = await this.sendMailWithRetry(mailOptions);
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
      const result = await this.sendMailWithRetry(mailOptions);
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
      const result = await this.sendMailWithRetry(mailOptions);
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

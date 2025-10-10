import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailRequestDto, ChangeEmailVerifyDto, ChangeEmailResendDto } from './dto/change-email.dto';
import { DeleteAccountRequestDto, DeleteAccountVerifyDto, DeleteAccountResendDto } from './dto/delete-account.dto';
import { ForgotPasswordRequestDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'donateur',
      },
    });

    // Générer le token JWT
    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }

  // Générer un code de vérification à 6 chiffres
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Stocker le code de vérification temporairement (en production, utiliser Redis)
  private verificationCodes = new Map<string, { code: string; expiresAt: Date; newEmail?: string }>();
  
  // Map temporaire pour stocker les codes de réinitialisation de mot de passe
  // En production, utiliser Redis ou une base de données
  private resetCodes = new Map<string, { userId: string; email: string; expiresAt: Date; code: string }>();

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent
    if (currentPassword === newPassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'actuel');
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async changeEmailRequest(userId: string, changeEmailRequestDto: ChangeEmailRequestDto) {
    const { newEmail, currentPassword } = changeEmailRequestDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    // Vérifier que le nouvel email est différent
    if (user.email === newEmail) {
      throw new BadRequestException('Le nouvel email doit être différent de l\'actuel');
    }

    // Vérifier que le nouvel email n'est pas déjà utilisé
    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée');
    }

    // Générer et stocker le code de vérification
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    this.verificationCodes.set(userId, {
      code: verificationCode,
      expiresAt,
      newEmail,
    });

    // Envoyer l'email avec le code de vérification
    try {
      await this.emailService.sendEmailVerificationCode(newEmail, verificationCode, user.firstName);
      console.log(`✅ Email de vérification envoyé à ${newEmail}`);
    } catch (error) {
      console.error('❌ Erreur envoi email de vérification:', error);
      // On continue même si l'email échoue, mais on log l'erreur
    }

    return { 
      message: 'Code de vérification envoyé à votre nouvelle adresse email',
      // En développement, on retourne le code pour les tests
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    };
  }

  async changeEmailVerify(userId: string, changeEmailVerifyDto: ChangeEmailVerifyDto) {
    const { newEmail, verificationCode } = changeEmailVerifyDto;

    // Récupérer le code stocké
    const storedData = this.verificationCodes.get(userId);
    if (!storedData) {
      throw new BadRequestException('Aucun code de vérification trouvé');
    }

    // Vérifier l'expiration
    if (new Date() > storedData.expiresAt) {
      this.verificationCodes.delete(userId);
      throw new BadRequestException('Code de vérification expiré');
    }

    // Vérifier le code
    if (storedData.code !== verificationCode) {
      throw new BadRequestException('Code de vérification incorrect');
    }

    // Vérifier l'email
    if (storedData.newEmail !== newEmail) {
      throw new BadRequestException('Adresse email incorrecte');
    }

    // Mettre à jour l'email
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    // Supprimer le code utilisé
    this.verificationCodes.delete(userId);

    return { message: 'Adresse email modifiée avec succès' };
  }

  async changeEmailResend(userId: string, changeEmailResendDto: ChangeEmailResendDto) {
    const { newEmail } = changeEmailResendDto;

    // Récupérer le code stocké
    const storedData = this.verificationCodes.get(userId);
    if (!storedData || storedData.newEmail !== newEmail) {
      throw new BadRequestException('Aucune demande de changement d\'email trouvée');
    }

    // Générer un nouveau code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    this.verificationCodes.set(userId, {
      code: verificationCode,
      expiresAt,
      newEmail,
    });

    // Envoyer l'email avec le nouveau code
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true }
      });
      
      await this.emailService.sendEmailVerificationCode(newEmail, verificationCode, user?.firstName || 'Utilisateur');
      console.log(`✅ Nouveau email de vérification envoyé à ${newEmail}`);
    } catch (error) {
      console.error('❌ Erreur envoi nouveau email de vérification:', error);
      // On continue même si l'email échoue, mais on log l'erreur
    }

    return { 
      message: 'Nouveau code de vérification envoyé',
      // En développement, on retourne le code pour les tests
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    };
  }

  async deleteAccountRequest(userId: string, deleteAccountRequestDto: DeleteAccountRequestDto) {
    const { email, password } = deleteAccountRequestDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'email
    if (user.email !== email) {
      throw new BadRequestException('Adresse email incorrecte');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    // Générer et stocker le code de vérification
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    this.verificationCodes.set(userId, {
      code: verificationCode,
      expiresAt,
    });

    // Envoyer l'email avec le code de vérification
    try {
      await this.emailService.sendAccountDeletionVerificationCode(email, verificationCode, user.firstName);
      console.log(`✅ Email de vérification suppression envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur envoi email suppression:', error);
      // On continue même si l'email échoue, mais on log l'erreur
    }

    return { 
      message: 'Code de vérification envoyé à votre adresse email',
      // En développement, on retourne le code pour les tests
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    };
  }

  async deleteAccountVerify(userId: string, deleteAccountVerifyDto: DeleteAccountVerifyDto) {
    const { email, verificationCode } = deleteAccountVerifyDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'email
    if (user.email !== email) {
      throw new BadRequestException('Adresse email incorrecte');
    }

    // Récupérer le code stocké
    const storedData = this.verificationCodes.get(userId);
    if (!storedData) {
      throw new BadRequestException('Aucun code de vérification trouvé');
    }

    // Vérifier l'expiration
    if (new Date() > storedData.expiresAt) {
      this.verificationCodes.delete(userId);
      throw new BadRequestException('Code de vérification expiré');
    }

    // Vérifier le code
    if (storedData.code !== verificationCode) {
      throw new BadRequestException('Code de vérification incorrect');
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await this.prisma.user.delete({
      where: { id: userId },
    });

    // Supprimer le code utilisé
    this.verificationCodes.delete(userId);

    return { message: 'Compte supprimé avec succès' };
  }

  async deleteAccountResend(userId: string, deleteAccountResendDto: DeleteAccountResendDto) {
    const { email } = deleteAccountResendDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'email
    if (user.email !== email) {
      throw new BadRequestException('Adresse email incorrecte');
    }

    // Générer un nouveau code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    this.verificationCodes.set(userId, {
      code: verificationCode,
      expiresAt,
    });

    // Envoyer l'email avec le nouveau code
    try {
      await this.emailService.sendAccountDeletionVerificationCode(email, verificationCode, user.firstName);
      console.log(`✅ Nouveau email de vérification suppression envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur envoi nouveau email suppression:', error);
      // On continue même si l'email échoue, mais on log l'erreur
    }

    return { 
      message: 'Nouveau code de vérification envoyé',
      // En développement, on retourne le code pour les tests
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    };
  }

  async forgotPasswordRequest(forgotPasswordRequestDto: ForgotPasswordRequestDto) {
    const { email } = forgotPasswordRequestDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Stocker le code temporairement
    this.resetCodes.set(user.id, {
      userId: user.id,
      email: user.email,
      expiresAt,
      code: verificationCode,
    });

    // Envoyer l'email avec le code de vérification
    try {
      await this.emailService.sendPasswordResetCode(email, verificationCode, user.firstName);
      console.log(`✅ Code de réinitialisation envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur envoi code réinitialisation:', error);
      // On continue même si l'email échoue, mais on log l'erreur
    }

    return { 
      message: 'Code de vérification envoyé',
      // En développement, on retourne le code pour les tests
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, verificationCode, password } = resetPasswordDto;

    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si le code existe et n'est pas expiré
    const codeData = this.resetCodes.get(user.id);
    if (!codeData) {
      throw new BadRequestException('Aucun code de vérification trouvé');
    }

    if (new Date() > codeData.expiresAt) {
      this.resetCodes.delete(user.id);
      throw new BadRequestException('Code de vérification expiré');
    }

    // Vérifier le code
    if (codeData.code !== verificationCode) {
      throw new BadRequestException('Code de vérification incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Supprimer le code utilisé
    this.resetCodes.delete(user.id);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
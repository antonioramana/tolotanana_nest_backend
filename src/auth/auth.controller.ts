import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailRequestDto, ChangeEmailVerifyDto, ChangeEmailResendDto } from './dto/change-email.dto';
import { DeleteAccountRequestDto, DeleteAccountVerifyDto, DeleteAccountResendDto } from './dto/delete-account.dto';
import { ForgotPasswordRequestDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides',
  })
  async login(@Request() req: { user: any }): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Mot de passe actuel incorrect ou nouveau mot de passe invalide',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-email-request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demander un changement d\'email' })
  @ApiResponse({
    status: 200,
    description: 'Code de vérification envoyé',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé',
  })
  async changeEmailRequest(
    @CurrentUser('id') userId: string,
    @Body() changeEmailRequestDto: ChangeEmailRequestDto,
  ) {
    return this.authService.changeEmailRequest(userId, changeEmailRequestDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-email-verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier le changement d\'email' })
  @ApiResponse({
    status: 200,
    description: 'Email modifié avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Code de vérification invalide ou expiré',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async changeEmailVerify(
    @CurrentUser('id') userId: string,
    @Body() changeEmailVerifyDto: ChangeEmailVerifyDto,
  ) {
    return this.authService.changeEmailVerify(userId, changeEmailVerifyDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-email-resend')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renvoyer le code de vérification pour le changement d\'email' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau code de vérification envoyé',
  })
  @ApiResponse({
    status: 400,
    description: 'Aucune demande de changement d\'email trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async changeEmailResend(
    @CurrentUser('id') userId: string,
    @Body() changeEmailResendDto: ChangeEmailResendDto,
  ) {
    return this.authService.changeEmailResend(userId, changeEmailResendDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('delete-account-request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demander la suppression du compte' })
  @ApiResponse({
    status: 200,
    description: 'Code de vérification envoyé',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async deleteAccountRequest(
    @CurrentUser('id') userId: string,
    @Body() deleteAccountRequestDto: DeleteAccountRequestDto,
  ) {
    return this.authService.deleteAccountRequest(userId, deleteAccountRequestDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('delete-account-verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier la suppression du compte' })
  @ApiResponse({
    status: 200,
    description: 'Compte supprimé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Code de vérification invalide ou expiré',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async deleteAccountVerify(
    @CurrentUser('id') userId: string,
    @Body() deleteAccountVerifyDto: DeleteAccountVerifyDto,
  ) {
    return this.authService.deleteAccountVerify(userId, deleteAccountVerifyDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('delete-account-resend')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renvoyer le code de vérification pour la suppression du compte' })
  @ApiResponse({
    status: 200,
    description: 'Nouveau code de vérification envoyé',
  })
  @ApiResponse({
    status: 400,
    description: 'Aucune demande de suppression trouvée',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  async deleteAccountResend(
    @CurrentUser('id') userId: string,
    @Body() deleteAccountResendDto: DeleteAccountResendDto,
  ) {
    return this.authService.deleteAccountResend(userId, deleteAccountResendDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander la réinitialisation du mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiBody({ type: ForgotPasswordRequestDto })
  async forgotPasswordRequest(@Body() forgotPasswordRequestDto: ForgotPasswordRequestDto) {
    return this.authService.forgotPasswordRequest(forgotPasswordRequestDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Token invalide ou expiré',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignVerificationService } from './campaign-verification.service';
import { CampaignVerificationController } from './campaign-verification.controller';
import { PublicCampaignsController } from './public-campaigns.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule, FavoritesModule],
  providers: [CampaignsService, CampaignVerificationService],
  controllers: [CampaignsController, CampaignVerificationController, PublicCampaignsController],
  exports: [CampaignsService, CampaignVerificationService],
})
export class CampaignsModule {}
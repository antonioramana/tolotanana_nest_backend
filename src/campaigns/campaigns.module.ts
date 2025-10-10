import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignVerificationService } from './campaign-verification.service';
import { CampaignVerificationController } from './campaign-verification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule],
  providers: [CampaignsService, CampaignVerificationService],
  controllers: [CampaignsController, CampaignVerificationController],
  exports: [CampaignsService, CampaignVerificationService],
})
export class CampaignsModule {}
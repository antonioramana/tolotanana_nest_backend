import { Module } from '@nestjs/common';
import { CampaignThankYouMessagesService } from './campaign-thank-you-messages.service';
import { CampaignThankYouMessagesController } from './campaign-thank-you-messages.controller';
import { PublicCampaignThankYouMessagesController } from './public-campaign-thank-you-messages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CampaignThankYouMessagesService],
  controllers: [CampaignThankYouMessagesController, PublicCampaignThankYouMessagesController],
  exports: [CampaignThankYouMessagesService],
})
export class CampaignThankYouMessagesModule {}


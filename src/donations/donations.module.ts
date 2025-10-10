import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ThankYouMessagesModule } from '../thank-you-messages/thank-you-messages.module';
import { PlatformFeesModule } from '../platform-fees/platform-fees.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ThankYouMessagesModule, PlatformFeesModule, NotificationsModule, EmailModule],
  providers: [DonationsService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {}
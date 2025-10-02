import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ThankYouMessagesModule } from '../thank-you-messages/thank-you-messages.module';
import { PlatformFeesModule } from '../platform-fees/platform-fees.module';

@Module({
  imports: [ThankYouMessagesModule, PlatformFeesModule],
  providers: [DonationsService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {}
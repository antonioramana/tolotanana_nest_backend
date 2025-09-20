import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { ThankYouMessagesModule } from '../thank-you-messages/thank-you-messages.module';

@Module({
  imports: [ThankYouMessagesModule],
  providers: [DonationsService],
  controllers: [DonationsController],
  exports: [DonationsService],
})
export class DonationsModule {}
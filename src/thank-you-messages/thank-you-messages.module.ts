import { Module } from '@nestjs/common';
import { ThankYouMessagesService } from './thank-you-messages.service';
import { ThankYouMessagesController } from './thank-you-messages.controller';

@Module({
  providers: [ThankYouMessagesService],
  controllers: [ThankYouMessagesController],
  exports: [ThankYouMessagesService],
})
export class ThankYouMessagesModule {}
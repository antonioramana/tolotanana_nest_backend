import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PublicContactController } from './public-contact.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [ContactService],
  controllers: [ContactController, PublicContactController],
  exports: [ContactService],
})
export class ContactModule {}

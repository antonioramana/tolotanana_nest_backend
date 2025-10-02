import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { PublicTestimonialsController } from './public-testimonials.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TestimonialsService],
  controllers: [TestimonialsController, PublicTestimonialsController],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}

import { PartialType } from '@nestjs/swagger';
import { CreateTestimonialDto } from './create-testimonial.dto';

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  // Hérite de tous les champs de CreateTestimonialDto en optionnel
}

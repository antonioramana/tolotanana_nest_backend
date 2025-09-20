import { PartialType } from '@nestjs/swagger';
import { CreateThankYouMessageDto } from './create-thank-you-message.dto';

export class UpdateThankYouMessageDto extends PartialType(CreateThankYouMessageDto) {}
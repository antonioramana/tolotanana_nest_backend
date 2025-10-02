import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@ApiTags('Public Contact')
@Controller('public/contact')
export class PublicContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message de contact (Public)' })
  @ApiResponse({
    status: 201,
    description: 'Message de contact envoyé avec succès',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cm123456789' },
        message: { type: 'string', example: 'Message envoyé avec succès' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async create(@Body() createDto: CreateContactMessageDto) {
    const message = await this.contactService.create(createDto);
    return {
      id: message.id,
      message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    };
  }
}

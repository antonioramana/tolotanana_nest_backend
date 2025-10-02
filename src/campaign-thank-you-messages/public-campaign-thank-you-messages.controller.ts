import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CampaignThankYouMessagesService } from './campaign-thank-you-messages.service';
import { CampaignThankYouMessageResponseDto } from './dto/campaign-thank-you-message-response.dto';

@ApiTags('Public Campaign Thank You Messages')
@Controller('public/campaign-thank-you-messages')
export class PublicCampaignThankYouMessagesController {
  constructor(private campaignThankYouMessagesService: CampaignThankYouMessagesService) {}

  @Get('campaign/:campaignId/active')
  @ApiOperation({ summary: 'Obtenir le message de remerciement actif d\'une campagne (public)' })
  @ApiResponse({
    status: 200,
    description: 'Message de remerciement actif récupéré avec succès',
    type: CampaignThankYouMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Aucun message de remerciement actif trouvé pour cette campagne',
  })
  async getActiveMessage(@Param('campaignId') campaignId: string) {
    return this.campaignThankYouMessagesService.getActiveMessage(campaignId);
  }
}



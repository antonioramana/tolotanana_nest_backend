import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BankInfoService } from './bank-info.service';
import { BankInfoResponseDto } from './dto/bank-info-response.dto';

@ApiTags('Public Bank Info')
@Controller('public/bank-info')
export class PublicBankInfoController {
  constructor(private bankInfoService: BankInfoService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Obtenir les informations bancaires de l\'administrateur (public)' })
  @ApiResponse({
    status: 200,
    description: 'Informations bancaires de l\'administrateur récupérées avec succès',
    type: [BankInfoResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Aucun administrateur trouvé',
  })
  async getAdminBankInfo() {
    return this.bankInfoService.findAdminBankInfo();
  }
}

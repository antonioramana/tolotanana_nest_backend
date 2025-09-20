import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({
    status: 200,
    description: 'API en fonctionnement',
  })
  check() {
    return {
      status: 'ok',
      message: 'API TOLOTANANA est en fonctionnement',
      timestamp: new Date().toISOString(),
    };
  }
}

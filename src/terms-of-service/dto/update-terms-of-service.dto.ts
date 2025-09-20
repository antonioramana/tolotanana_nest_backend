import { PartialType } from '@nestjs/swagger';
import { CreateTermsOfServiceDto } from './create-terms-of-service.dto';

export class UpdateTermsOfServiceDto extends PartialType(CreateTermsOfServiceDto) {}

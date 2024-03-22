import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrencyTransferServiceDto } from './create-currency-transfer-service.dto';

export class UpdateCurrencyTransferServiceDto extends PartialType(CreateCurrencyTransferServiceDto) {}

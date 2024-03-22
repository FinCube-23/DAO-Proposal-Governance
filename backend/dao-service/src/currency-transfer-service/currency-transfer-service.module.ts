import { Module } from '@nestjs/common';
import { CurrencyTransferServiceService } from './currency-transfer-service.service';
import { CurrencyTransferServiceController } from './currency-transfer-service.controller';

@Module({
  controllers: [CurrencyTransferServiceController],
  providers: [CurrencyTransferServiceService],
})
export class CurrencyTransferServiceModule {}

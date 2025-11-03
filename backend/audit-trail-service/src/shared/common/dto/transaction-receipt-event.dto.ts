import { OnChainDataDto } from 'src/shared/common/dto/onchain-data.dto';

export class TransactionReceiptEventDto {
  timestamp: string;
  method: string;
  path: string;
  onChainData: OnChainDataDto;
  full_dto: any;
}

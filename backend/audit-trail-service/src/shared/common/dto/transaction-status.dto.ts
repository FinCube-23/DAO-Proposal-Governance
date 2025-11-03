import { OnChainDataDto } from './onchain-data.dto';

export class TransactionStatusDto {
  web3Status: number;
  message: string;
  data?: Record<string, any>;
  blockNumber: number;
  onChainData?: OnChainDataDto;
}

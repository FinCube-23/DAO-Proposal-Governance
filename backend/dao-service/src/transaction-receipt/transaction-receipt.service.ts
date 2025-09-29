import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

interface OnChainData {
  transactionHash: string;
  signedBy: string;
  signedWith: string;
  chainId: string;
  context: string;
}

interface TransactionReceiptEvent {
  timestamp: string;
  method: string;
  path: string;
  onChainData: OnChainData;
  full_dto: any;
}

@Injectable()
export class TransactionReceiptService {
  private readonly logger = new Logger(TransactionReceiptService.name);
  private eventHandlers: Record<string, (event: TransactionReceiptEvent) => Promise<void>>;

  constructor() {
    this.eventHandlers = {
      transaction_receipt: this.handleTransactionReceipt.bind(this),
    };
  }

  // 📡 Listening to Transaction Receipt Exchange
  @RabbitSubscribe({
    exchange: 'exchange.transaction-receipt.fanout',
    routingKey: '',
    queue: 'dao-service-transaction-receipt-queue',
    queueOptions: {
      durable: true,
    },
  })
  async handleTransactionReceiptEvent(event: TransactionReceiptEvent) {
    this.logger.log(
      `📧 Received transaction receipt event: ${JSON.stringify({
        timestamp: event.timestamp,
        method: event.method,
        path: event.path,
        transactionHash: event.onChainData?.transactionHash,
        signedBy: event.onChainData?.signedBy,
        context: event.onChainData?.context,
      })}`
    );

    try {
      // Always use transaction_receipt handler
      this.logger.log(`⚡ Event Type: transaction_receipt`);
      this.logger.log(`⚙️ Executing handler...`);
      await this.eventHandlers['transaction_receipt'](event);

      this.logger.log('✅ Transaction receipt processing complete');
    } catch (error) {
      this.logger.error(`❌ Processing failed: ${error.message}`, error.stack);
    }
  }

  // ===== HANDLER IMPLEMENTATIONS =====
  private async handleTransactionReceipt(event: TransactionReceiptEvent): Promise<void> {
    const { onChainData } = event;
    const trxHash = onChainData?.transactionHash;
    
    // Log the specific message format as requested
    const logMessage = {
      message: 'Triggering transaction hash from the from Kong API as on-chain referance',
      trxHash: trxHash
    };
    
    this.logger.log(`💰 ${JSON.stringify(logMessage)}`);

    // TODO: Implement transaction receipt processing logic
    // - Log transaction details in DAO service
    // - Update proposal transaction history
    // - Generate DAO-specific receipt document
  }
}

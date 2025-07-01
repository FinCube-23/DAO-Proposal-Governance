export class ResponseTransactionStatusDto {
    web3Status: number;
    message: string;
    data?: Record<string, any>;
    blockNumber: number;
    transactionHash: string;
}
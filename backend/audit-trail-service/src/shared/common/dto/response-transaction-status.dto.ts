export class ResponseTransactionStatusDto {
    web3Status: number;
    message: string;
    blockNumber: number;
    transactionHash: string;
}

/**
 * NOTE:
 * - Make sure you import: import { WEB3STATUS, web3StatusCode } from 'src/shared/common/constants';
 * - For inserting status code in the json response use: web3StatusCode[WEB3STATUS.PENDING];
 * - For inserting message in the json response use: WEB3STATUS.PENDING;
 */
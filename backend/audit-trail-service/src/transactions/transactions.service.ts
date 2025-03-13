import { TransactionConfirmationSource, TransactionEntity, TransactionStatus } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';


@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);
    constructor(
        @InjectRepository(TransactionEntity) private transactionRepository: Repository<TransactionEntity>,
    ) {
    }

    async create(transactionPacket: Partial<TransactionEntity>): Promise<TransactionEntity> {
        try {
            const new_transaction = this.transactionRepository.create(transactionPacket);
            this.logger.log(`New transaction initialized at Audit Trail DB, where transaction hash: ${new_transaction.trx_hash}`);
            return this.transactionRepository.save(new_transaction);
        } catch (err) {
            this.logger.error(`Transaction couldn't logged in Web2 DB where transaction hash is ${transactionPacket.trx_hash}. Error: ${err}`);
            throw new Error("Transaction couldn't logged in Web2 DB.");
        }
    }

    async updateStatus(trxHash: string, metadata: string, source: TransactionConfirmationSource, newStatus: number): Promise<TransactionEntity> {
        try {
            const transactions = await this.transactionRepository.find({
                where: { trx_hash: trxHash }
            });

            if (transactions.length === 0) {
                this.logger.warn(`Transaction ${trxHash} not found in DB. Skipping update.`);
                return null;
            }

            const transaction = transactions[0];

            this.logger.log(`Transaction found! Updating at Audit Trail DB at PK: ${transaction.id}`);

            transaction.trx_status = newStatus as TransactionStatus;
            transaction.trx_metadata = metadata;
            transaction.confirmation_source = source;

            return await this.transactionRepository.save(transaction);
        } catch (err) {
            this.logger.error(`Transaction status couldn't get updated for transaction hash: ${trxHash}. Error: ${err}`);
            throw new Error("Transaction status couldn't get updated.");
        }
    }
    async getPendingTransactionHash(): Promise<string[]> {
        try {
            const transactions = await this.transactionRepository.find({
                where: {
                    trx_status: TransactionStatus.PENDING
                }
            });
            return transactions.map(transaction => transaction.trx_hash);
        } catch {
            this.logger.error("Could not find any pending transactions");
            return [];
        }
    }
}

import { TransactionEntity } from './entities/transaction.entity';
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
            this.logger.log(`New transaction recorded in Audit Trail DB, where PK: ${new_transaction.id}`);
            return this.transactionRepository.save(new_transaction);
        } catch (err) {
            this.logger.error(`Transaction couldn't logged in Web2 DB where transaction hash is ${transactionPacket.trx_hash}. Error: ${err}`);
            throw new Error("Transaction couldn't logged in Web2 DB.");
        }
    }

    async updateStatus(trxHash: string, newStatus: number): Promise<TransactionEntity> {
        try {
            const transaction = await this.transactionRepository.findOne({
                where: { trx_hash: trxHash }
            });
            this.logger.log(`Transaction status found! Getting updated at Audit Trail DB at PK: ${transaction.id} where transaction status is: ${transaction.trx_status}.`);
            if (!transaction) {
                throw new NotFoundException(`Transaction with hash ${trxHash} not found`);
            }
            transaction.trx_status = newStatus;
            this.logger.log(`Transaction status updated at PK: ${transaction.id} where transaction status is: ${transaction.trx_status}.`);
            return await this.transactionRepository.save(transaction);
        } catch (err) {
            this.logger.error(`Transaction status couldn't get updated for transaction hash: ${trxHash}. Error: ${err}`);
            throw new Error("Transaction status couldn't get updated.");
        }
    }
}

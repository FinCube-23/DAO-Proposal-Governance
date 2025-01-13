import { TransactionEntity } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
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
            this.logger.error("Transaction couldn't logged in Web2 DB. Error: " + err);
            throw new Error("Transaction couldn't logged in Web2 DB.");
        }
    }
}

import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity  } from './entities/transaction.entity';


@Module({
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity ])
  ],
  exports: [TransactionsService]

})
export class TransactionsModule {}

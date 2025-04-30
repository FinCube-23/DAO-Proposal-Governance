import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity  } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';


@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([TransactionEntity ])
  ],
  exports: [TransactionsService]

})
export class TransactionsModule {}

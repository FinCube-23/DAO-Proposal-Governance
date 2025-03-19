// src/transactions/transactions.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { TransactionListItemDto, TransactionListResponseDto } from './dto/transaction-list-response.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiTags('Transaction Off-Chain Backup')
  @ApiOperation({ summary: 'Get example data' })
  @ApiOkResponse({ type: TransactionListResponseDto })
  async findAll(@Query() query: ListTransactionsQueryDto): Promise<TransactionListResponseDto> {
    return this.transactionsService.findAll(query);
  }

}
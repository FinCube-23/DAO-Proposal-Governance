// src/transactions/transactions.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import {
  TransactionListItemDto,
  TransactionListResponseDto,
} from './dto/transaction-list-response.dto';
import { TransactionDetailResponseDto } from './dto/transaction-detail.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiTags('Transaction Off-Chain Backup')
  @ApiOperation({ summary: 'Get example data' })
  @ApiOkResponse({ type: TransactionListResponseDto })
  async findAll(
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return this.transactionsService.findAll(query);
  }

  @Get(':identifier')
  @ApiTags('Transaction Off-Chain Backup')
  @ApiOperation({
    summary: 'Get transaction details by ID or hash',
    description:
      'Retrieves a single transaction using either its numeric ID or transaction hash',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Transaction ID (number) or transaction hash (string)',
    example: '123 or 0x1234567890abcdef',
  })
  @ApiOkResponse({ type: TransactionDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Transaction not found' })
  async findOne(
    @Param('identifier') identifier: string,
  ): Promise<TransactionDetailResponseDto> {
    // Check if identifier is a number (ID) or string (hash)
    if (/^\d+$/.test(identifier)) {
      return this.transactionsService.findById(Number(identifier));
    } else {
      return this.transactionsService.findByHash(identifier);
    }
  }
}

// src/transactions/transactions.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionGatewayService } from './transaction-gateway.service';
import { ListTransactionsQueryDto } from './dto/list-transactions.dto';
import { TransactionListResponseDto } from './dto/transaction-list-response.dto';
import { TransactionDetailResponseDto } from './dto/transaction-detail.dto';

@Controller('transactions')
export class TransactionGatewayController {
  constructor(private readonly transactionsGatewayService: TransactionGatewayService) {}

  @Get()
  @ApiTags('Transaction Off-Chain Backup')
  @ApiOperation({ summary: 'Get example data' })
  @ApiOkResponse({ type: TransactionListResponseDto })
  async findAll(
    @Query() query: ListTransactionsQueryDto,
  ): Promise<TransactionListResponseDto> {
    return this.transactionsGatewayService.findAll(query);
  }

  @Get('dashboard-stats')
  @ApiTags('Transaction Off-Chain Backup')
  @ApiOperation({ summary: 'Get transaction statistics and metrics' })
  @ApiOkResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTransactions: { type: 'number', example: 1500 },
        pendingTransactions: { type: 'number', example: 45 },
        confirmedTransactions: { type: 'number', example: 1455 },
        unsyncedTransactions: { type: 'number', example: 188 },
        syncRate: {
          type: 'number',
          example: 87.5,
          description: 'Percentage of synced transactions',
        },
        totalLiquidity: { type: 'string', example: '1500000000000000000' },
        confirmationSourceBreakdown: {
          type: 'object',
          example: {
            alchemy: 500,
            infura: 300,
            graph: 200,
            manual: 100,
            pending_source: 400,
          },
        },
        averageConfirmationTime: {
          type: 'string',
          example: '5 minutes',
          description: 'Average time between creation and confirmation',
        },
      },
    },
  })
  async getDashboardStatistics() {
    return this.transactionsGatewayService.getStatistics();
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
      return this.transactionsGatewayService.findById(Number(identifier));
    } else {
      return this.transactionsGatewayService.findByHash(identifier);
    }
  }
}

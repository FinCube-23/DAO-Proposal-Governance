import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import {
  TransactionEntity,
  TransactionStatus,
} from 'src/shared/common/entity/transaction.entity';
import { Repository } from 'typeorm';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';

class TransactionGatewayUtil {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(TransactionGatewayUtil.name);
  }

  public overallTransactionStats(transactions: TransactionEntity[]) {
    this.logger.log('Calculating overall transaction statistics');
    const totalTransactions = transactions.length;

    const pendingTransactions = transactions.filter(
      (tx) => tx.trx_status === TransactionStatus.PENDING,
    ).length;

    const confirmedTransactions = transactions.filter(
      (tx) => tx.trx_status === TransactionStatus.CONFIRMED,
    ).length;

    const unsyncedTransactions = transactions.filter(
      (tx) => !tx.transaction_confirmation_trace,
    ).length;

    const syncedTransactions = totalTransactions - unsyncedTransactions;
    const syncRate =
      totalTransactions === 0
        ? 0
        : (syncedTransactions / totalTransactions) * 100;

    const confirmedTxWithTimes = transactions.filter(
      (tx) =>
        tx.trx_status === TransactionStatus.CONFIRMED &&
        tx.created_at &&
        tx.updated_at,
    );

    let averageConfirmationTime = null;
    if (confirmedTxWithTimes.length > 0) {
      const totalMilliseconds = confirmedTxWithTimes.reduce((sum, tx) => {
        const createdAt = new Date(tx.created_at).getTime();
        const updatedAt = new Date(tx.updated_at).getTime();
        return sum + (updatedAt - createdAt);
      }, 0);
      averageConfirmationTime = totalMilliseconds / confirmedTxWithTimes.length;
    }

    this.logger.log(
      `Statistics calculated: Total=${totalTransactions}, Pending=${pendingTransactions}, Confirmed=${confirmedTransactions}`,
    );

    return {
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      syncRate: parseFloat(syncRate.toFixed(2)),
      averageConfirmationTime: averageConfirmationTime || 'N/A',
    };
  }

  /**
   * Calculate transaction fee details
   * @param gasUsed Amount of gas used
   * @param gasPrice Gas price in wei
   * @returns TransactionFee object with fee breakdown
   */
  public calculateTransactionFee(gasUsed: bigint, gasPrice: bigint) {
    this.logger.log(
      `Calculating transaction fee for gasUsed=${gasUsed}, gasPrice=${gasPrice}`,
    );
    const feeInWei = gasUsed * gasPrice;
    const feeInEth = Number(feeInWei) / 1e18; // Convert wei to ETH

    return {
      feeInWei: feeInWei.toString(),
      feeInEth,
    };
  }

  /**
   * Generate transaction lifecycle from submission to completion
   * @param transaction Transaction entity
   * @returns TransactionLifecycle object with all stages
   */
  public generateTransactionLifecycle(transaction: TransactionEntity) {
    this.logger.log(
      `Generating transaction lifecycle for hash: ${transaction.trx_hash}`,
    );
    const trace = transaction.transaction_confirmation_trace || [];
    const metadata = this.parseMetadata(transaction);
    const blockTimestamp = parseInt(metadata.blockTimestamp, 10);
    const blockDate = new Date(blockTimestamp * 1000);

    const lifecycle = [...trace];

    // Validate blockTimestamp before using it
    if (blockTimestamp) {
      if (!isNaN(blockDate.getTime())) {
        lifecycle.push({
          service: 'Blockchain',
          status: 'completed',
          timestamp: blockDate.toISOString(),
        });
        this.logger.log(
          `Added blockchain timestamp to lifecycle: ${blockDate.toISOString()}`,
        );
      } else {
        this.logger.warn(
          `Invalid block timestamp for transaction ${transaction.trx_hash}: ${blockDate}`,
        );
      }
    }

    lifecycle.push({
      service: 'Submission',
      status: 'completed',
      timestamp: transaction.created_at.toISOString(),
    });

    lifecycle.push({
      service: 'Completion',
      status: 'completed',
      timestamp: transaction.updated_at.toISOString(),
    });

    return lifecycle.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  /**
   * Parse __typename from transaction object
   * @param transaction Transaction object
   * @returns Parsed __typename
   */
  public getResourceTypeStats(transactions: TransactionEntity[]) {
    this.logger.log('Calculating resource type statistics');
    const resourceTypeStats = transactions.reduce(
      (acc, tx) => {
        const metadata = this.parseMetadata(tx);
        const resourceType = metadata.__typename || 'unknown';
        acc[resourceType] = (acc[resourceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    this.logger.log(
      `Resource type stats calculated: ${JSON.stringify(resourceTypeStats)}`,
    );
    return resourceTypeStats;
  }

  /**
   * Parse metadata from transaction
   * @param transaction Transaction object
   * @returns Parsed metadata object
   */
  public parseMetadata(transaction: any) {
    try {
      const metadata = JSON.parse(transaction.trx_metadata || '{}');
      const typeName = metadata.data?.__typename;
      if (typeName) {
        return metadata.data;
      }
      return metadata;
    } catch (error) {
      this.logger.error(
        `Error parsing metadata for transaction ${transaction.trx_hash}: ${error.message}`,
      );
      return {};
    }
  }

  public getTopParticipants(transactions: TransactionEntity[], topN: number) {
    this.logger.log(`Getting top ${topN} participants`);
    const participantMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const participant = tx.trx_receipt?.from || 'unknown';
      participantMap.set(
        participant,
        (participantMap.get(participant) || 0) + 1,
      );
    });

    // Sort participants by transaction count and get top N
    const topParticipants = Array.from(participantMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    this.logger.log(`Top ${topN} participants calculated`);
    return topParticipants.map(([participant, count]) => ({
      participant,
      count,
    }));
  }

  public async generateTransactionTimeSeries() {
    this.logger.log('Generating transaction time series data');
    const currentDay = new Date();
    const end = currentDay;
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    try {
      // Fetch all transactions within the date range
      const transactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.created_at >= :start', { start })
        .andWhere('transaction.created_at <= :end', { end })
        .select([
          'DATE(transaction.created_at) as date',
          'transaction.trx_status as status',
          'COUNT(*) as count',
        ])
        .groupBy('DATE(transaction.created_at)')
        .addGroupBy('transaction.trx_status')
        .getRawMany();

      this.logger.log(
        `Fetched ${transactions.length} transaction records for time series`,
      );
      this.logger.log(
        `Sample transaction data: ${JSON.stringify(transactions.slice(0, 3))}`,
      );

      // Create a map to organize data by date
      const dateMap = new Map<
        string,
        { successful: number; pending: number }
      >();

      // Initialize all dates in the range with zero counts
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dateMap.set(dateStr, { successful: 0, pending: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Populate the map with actual transaction data
      transactions.forEach((tx) => {
        // Convert date to string if it's not already
        const dateStr =
          typeof tx.date === 'string'
            ? tx.date
            : new Date(tx.date).toISOString().split('T')[0];
        const count = parseInt(tx.count, 10);

        this.logger.log(
          `Processing transaction: date=${dateStr}, status=${tx.status}, count=${count}`,
        );

        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { successful: 0, pending: 0 });
        }

        const entry = dateMap.get(dateStr);

        // Log the status comparison
        this.logger.log(
          `Status comparison: tx.status="${tx.status}", CONFIRMED="${TransactionStatus.CONFIRMED}", PENDING="${TransactionStatus.PENDING}"`,
        );

        if (tx.status == TransactionStatus.CONFIRMED) {
          entry.successful += count;
          this.logger.log(
            `Added ${count} successful transactions for ${dateStr}`,
          );
        } else if (tx.status == TransactionStatus.PENDING) {
          entry.pending += count;
          this.logger.log(`Added ${count} pending transactions for ${dateStr}`);
        } else {
          this.logger.warn(
            `Unknown transaction status "${tx.status}" for date ${dateStr}`,
          );
        }
      });

      // Convert map to array format
      const chartData = Array.from(dateMap.entries())
        .map(([date, counts]) => ({
          date,
          successful: counts.successful,
          pending: counts.pending,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      this.logger.log(
        `Time series data generated with ${chartData.length} data points`,
      );
      return chartData;
    } catch (error) {
      this.logger.error(
        `Error generating transaction time series: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

export { TransactionGatewayUtil };

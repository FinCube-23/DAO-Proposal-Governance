import { ApolloClient, gql } from '@apollo/client';
import { Injectable, Inject } from '@nestjs/common';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
const { Network, Alchemy } = require('alchemy-sdk');

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network[process.env.ALCHEMY_NETWORK] || Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

@Injectable()
export class TransactionIndexerRepository {
  constructor(
    @Inject('APOLLO_CLIENT1') private apolloClient: ApolloClient<any>,
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(TransactionIndexerRepository.name);
  }

  async getTransactionReceiptUpdatesFromAlchemy(
    transactionHash: string): Promise<any> {
      try{
        this.logger.log(
          `Fetching transaction receipt for hash: ${transactionHash}`,
        );
        
        const receipt = await alchemy.core.getTransactionReceipt(transactionHash);

        return receipt;
      } catch (error) {
        this.logger.error(
          `Error fetching transaction receipt for hash: ${transactionHash}`,
          error,
        );
        throw new Error(`ALCHEMY_API_ERROR`);
      }
    }

  async getTransactionUpdatesFromTheGraph(
    transactionHashes: string[],
  ): Promise<any> {
    try {
      if (!transactionHashes || transactionHashes.length === 0) {
        this.logger.log('Transaction hash list is empty');
        return;
      }

      const validHashes = transactionHashes.filter((hash) =>
        /^0x[a-fA-F0-9]{64}$/.test(hash),
      );

      if (validHashes.length === 0) {
        this.logger.warn('No valid transaction hashes found after filtering.');
        throw new Error('NO_VALID_TRANSACTION_HASHES');
      }

      this.logger.log(
        `Fetching event data for transactions: ${validHashes.join(', ')}`,
      );

      const result = await this.apolloClient.query({
        query: this.transactionUpdateQuery(),
        variables: { transactionHashes: validHashes },
      });

      this.logger.log(`Raw query response: ${JSON.stringify(result)}`);

      const {
        proposalExecuteds,
        proposalAddeds,
        proposalCanceleds,
        ownershipTransferreds,
        memberRegistereds,
        memberApproveds,
      } = result.data || {};

      if (
        !proposalExecuteds &&
        !proposalAddeds &&
        !proposalCanceleds &&
        !ownershipTransferreds &&
        !memberRegistereds &&
        !memberApproveds
      ) {
        this.logger.warn(
          `No relevant events found for transaction hashes: ${validHashes.join(', ')}`,
        );
        throw new Error(`NO_EVENT_DATA_FOUND`);
      }

      const transactionsData = {
        proposalExecuteds: proposalExecuteds || [],
        proposalAddeds: proposalAddeds || [],
        proposalCanceleds: proposalCanceleds || [],
        ownershipTransferreds: ownershipTransferreds || [],
        memberRegistereds: memberRegistereds || [],
        memberApproveds: memberApproveds || [],
      };

      this.logger.log(
        'Fetched transaction event data successfully',
        JSON.stringify(transactionsData),
      );

      return transactionsData;
    } catch (error) {
      if (error.networkError) {
        this.logger.error(
          `Network error while fetching transactions`,
          error.networkError,
        );
        throw new Error(`NETWORK_ERROR`);
      }

      if (error.graphQLErrors?.length > 0) {
        this.logger.error(
          `GraphQL errors while fetching transactions`,
          error.graphQLErrors,
        );
        throw new Error(`GRAPHQL_ERROR`);
      }

      if (
        error.message.includes('NO_EVENT_DATA_FOUND') ||
        error.message.includes('INVALID_TRANSACTION_HASHES')
      ) {
        throw error;
      }

      this.logger.error(`Unexpected error while fetching transactions`, error);
      throw new Error(`UNEXPECTED_ERROR`);
    }
  }

  private transactionUpdateQuery(): any {
    const query = gql`
      query GetTransactionsByHashes($transactionHashes: [String!]!) {
        proposalExecuteds(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          proposalId
          blockNumber
          blockTimestamp
          __typename
        }
        proposalAddeds(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          proposalId
          proposalType
          data
          blockNumber
          blockTimestamp
          __typename
        }
        proposalCanceleds(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          proposalId
          blockNumber
          blockTimestamp
          __typename
        }
        ownershipTransferreds(
          where: { transactionHash_in: $transactionHashes }
        ) {
          id
          transactionHash
          blockNumber
          blockTimestamp
          __typename
        }
        memberRegistereds(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          blockNumber
          blockTimestamp
          __typename
        }
        memberApproveds(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          blockNumber
          blockTimestamp
          __typename
        }
      }
    `;
    return query;
  }
}

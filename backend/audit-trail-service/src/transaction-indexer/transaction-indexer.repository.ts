import { ApolloClient, gql } from '@apollo/client';
import { Injectable, Inject } from '@nestjs/common';
import { WinstonLogger } from 'src/shared/common/logger/winston-logger';
const { Network, Alchemy } = require('alchemy-sdk');

// Map environment network names to Alchemy SDK Network enum or custom URL
const getAlchemySettings = (networkName: string, apiKey: string, alchemyUrl?: string) => {
  const networkMap = {
    'eth-mainnet': Network.ETH_MAINNET,
    'eth-sepolia': Network.ETH_SEPOLIA,
    'eth-goerli': Network.ETH_GOERLI,
    'polygon-mainnet': Network.MATIC_MAINNET,
    'polygon-mumbai': Network.MATIC_MUMBAI,
    'polygon-amoy': Network.MATIC_AMOY,
    'arbitrum-mainnet': Network.ARB_MAINNET,
    'arbitrum-sepolia': Network.ARB_SEPOLIA,
    'optimism-mainnet': Network.OPT_MAINNET,
    'optimism-sepolia': Network.OPT_SEPOLIA,
    'base-mainnet': Network.BASE_MAINNET,
    'base-sepolia': Network.BASE_SEPOLIA,
  };
  
  // If network is in the map, use it
  if (networkMap[networkName]) {
    return {
      apiKey,
      network: networkMap[networkName],
    };
  }
  
  // For custom networks like celo-sepolia, use custom URL
  if (alchemyUrl) {
    return {
      apiKey,
      url: alchemyUrl,
    };
  }
  
  // Fallback to ETH_SEPOLIA
  return {
    apiKey,
    network: Network.ETH_SEPOLIA,
  };
};

const settings = getAlchemySettings(
  process.env.ALCHEMY_NETWORK,
  process.env.ALCHEMY_API_KEY,
  process.env.ALCHEMY_URL,
);

const alchemy = new Alchemy(settings);

@Injectable()
export class TransactionIndexerRepository {
  constructor(
    @Inject('APOLLO_CLIENT1') private apolloClient: ApolloClient<any>,
    private readonly logger: WinstonLogger,
  ) {
    this.logger.setContext(TransactionIndexerRepository.name);
    this.logger.log(
      `Alchemy initialized with network: ${process.env.ALCHEMY_NETWORK}, URL: ${settings.url || 'using network enum'}`,
    );
  }

  async getTransactionReceiptUpdatesFromAlchemy(
    transactionHash: string): Promise<any> {
      try{
        this.logger.log(
          `Fetching transaction receipt for hash: ${transactionHash}`,
        );
        
        const receipt = await alchemy.core.getTransactionReceipt(transactionHash);

        if (!receipt) {
          this.logger.warn(
            `No receipt found for transaction: ${transactionHash}, receipt will be null`,
          );
          return null;
        }

        this.logger.log(
          `Successfully fetched receipt for transaction: ${transactionHash}`,
        );
        return receipt;
      } catch (error) {
        this.logger.error(
          `Error fetching transaction receipt for hash: ${transactionHash}. Error: ${error.message}`,
          error.stack,
        );
        throw new Error(`ALCHEMY_API_ERROR: ${error.message}`);
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

      const invalidHashes = transactionHashes.filter(
        (hash) => !/^0x[a-fA-F0-9]{64}$/.test(hash),
      );

      if (invalidHashes.length > 0) {
        this.logger.warn(
          `Found ${invalidHashes.length} invalid transaction hash(es): ${invalidHashes.join(', ')}`,
        );
      }

      if (validHashes.length === 0) {
        this.logger.warn(
          'No valid transaction hashes found after filtering. All hashes are invalid format.',
        );
        throw new Error('NO_VALID_TRANSACTION_HASHES');
      }

      this.logger.log(
        `Validated ${validHashes.length} out of ${transactionHashes.length} transaction hash(es)`,
      );

      this.logger.log(
        `Fetching event data for transactions: ${validHashes.join(', ')}`,
      );

      this.logger.log(
        `Querying subgraph at: ${process.env.SUBGRAPH_QUERY_ENDPOINT}`,
      );

      const query = this.transactionUpdateQuery();
      this.logger.log(`GraphQL Query: ${query.loc.source.body.substring(0, 500)}...`);

      const result = await this.apolloClient.query({
        query,
        variables: { transactionHashes: validHashes },
        fetchPolicy: 'network-only', // Force fresh data from The Graph
      });

      this.logger.log(`Raw query response: ${JSON.stringify(result)}`);
      this.logger.log(`Response data keys: ${Object.keys(result.data || {}).join(', ')}`);

      const {
        proposalExecuteds,
        proposalAddeds,
        proposalCanceleds,
        ownershipTransferreds,
        memberRegistereds,
        memberApproveds,
        stablecoinTransfers,
      } = result.data || {};

      // Check if any events were found
      const hasAnyEvents = 
        (proposalExecuteds && proposalExecuteds.length > 0) ||
        (proposalAddeds && proposalAddeds.length > 0) ||
        (proposalCanceleds && proposalCanceleds.length > 0) ||
        (ownershipTransferreds && ownershipTransferreds.length > 0) ||
        (memberRegistereds && memberRegistereds.length > 0) ||
        (memberApproveds && memberApproveds.length > 0) ||
        (stablecoinTransfers && stablecoinTransfers.length > 0);

      if (!hasAnyEvents) {
        this.logger.warn(
          `No relevant events found for transaction hashes: ${validHashes.join(', ')}. Transactions may not be indexed yet or may be from a different contract.`,
        );
        // Return empty arrays instead of throwing error
        return {
          proposalExecuteds: [],
          proposalAddeds: [],
          proposalCanceleds: [],
          ownershipTransferreds: [],
          memberRegistereds: [],
          memberApproveds: [],
          stablecoinTransfers: [],
        };
      }

      const transactionsData = {
        proposalExecuteds: proposalExecuteds || [],
        proposalAddeds: proposalAddeds || [],
        proposalCanceleds: proposalCanceleds || [],
        ownershipTransferreds: ownershipTransferreds || [],
        memberRegistereds: memberRegistereds || [],
        memberApproveds: memberApproveds || [],
        stablecoinTransfers: stablecoinTransfers || [],
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

      if (error.message.includes('NO_VALID_TRANSACTION_HASHES')) {
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
        stablecoinTransfers(where: { transactionHash_in: $transactionHashes }) {
          id
          transactionHash
          memo
          memoHash
          nullifier
          sender_reference_number
          receiver_reference_number
          to
          from
          amount
          blockNumber
          blockTimestamp
          __typename
        }
      }
    `;
    return query;
  }
}

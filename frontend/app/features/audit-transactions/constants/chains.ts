export const STATUS_CONFIG = {
  1: { label: 'Success', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  0: { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
} as const;

export const SOURCE_TYPES = [
  'graph',
  'alchemy',
] as const;

export const CHAIN_INFO = {
  'ethereum:1': {
    name: 'Ethereum',
    shortName: 'ETH',
    color: 'bg-blue-500',
    explorer: 'https://etherscan.io',
    currency: 'ETH',
  },
  'polygon:137': {
    name: 'Polygon',
    shortName: 'MATIC',
    color: 'bg-purple-500',
    explorer: 'https://polygonscan.com',
    currency: 'MATIC',
  },
  'arbitrum:42161': {
    name: 'Arbitrum',
    shortName: 'ARB',
    color: 'bg-cyan-500',
    explorer: 'https://arbiscan.io',
    currency: 'ETH',
  },
  'optimism:10': {
    name: 'Optimism',
    shortName: 'OP',
    color: 'bg-red-500',
    explorer: 'https://optimistic.etherscan.io',
    currency: 'ETH',
  },
  'base:8453': {
    name: 'Base',
    shortName: 'BASE',
    color: 'bg-blue-600',
    explorer: 'https://basescan.org',
    currency: 'ETH',
  },
} as const;

export type ChainReference = keyof typeof CHAIN_INFO;

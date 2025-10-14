export const STATUS_CONFIG = {
  success: { label: 'Success', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  reverted: { label: 'Reverted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  replaced: { label: 'Replaced', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
} as const;

export const RESOURCE_KINDS = [
  'TOKEN',
  'NFT',
  'PROPOSAL',
  'POOL',
  'VAULT',
  'BRIDGE_MESSAGE',
  'DOMAIN',
  'CERTIFICATE',
  'IDENTITY',
  'CONTRACT',
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

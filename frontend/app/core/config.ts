import { sepolia } from 'viem/chains';
import { createConfig, http, injected } from 'wagmi';
import { env } from '@/core/env';

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  ssr: true,
  transports: {
    [sepolia.id]: http(`${env.VITE_SEPOLIA_RPC}`),
  },
});

export const tokenConfig = {
  usdc: {
    1: {
      // Ethereum
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      image: 'https://etherscan.io/token/images/centre-usdc_28.png',
    },
    137: {
      // Polygon POS
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      image: 'https://polygonscan.com/token/images/centre-usdc_28.png',
    },
    10: {
      // Optimism
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      decimals: 6,
      image: 'https://optimistic.etherscan.io/token/images/centre-usdc_28.png',
    },
    80002: {
      // Polygon Amoy
      address: '0x2a0dD4b621e65B093EaA794C1a7F259eE0dA9456',
      decimals: 6,
      image: 'https://amoy.polygonscan.com/token/images/centre-usdc_28.png',
    },
    11155111: {
      // Ethereum Sepolia
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC test token
      decimals: 6,
      image: 'https://etherscan.io/token/images/centre-usdc_28.png',
    },
  },
};

import { sepolia } from 'viem/chains';
import { createConfig, http, injected } from 'wagmi';
import { env } from '@/core/env';

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  ssr: true,
  transports: {
    [sepolia.id]: http(`${env.NEXT_PUBLIC_SEPOLIA_RPC}`),
  },
});

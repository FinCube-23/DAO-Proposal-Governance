'use client';

import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/core/config';
import Header from './header';
import '@rainbow-me/rainbowkit/styles.css';

interface Props {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function HOC({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7b3fe4',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'rounded',
            overlayBlur: 'large',
          })}
        >
          <Header />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

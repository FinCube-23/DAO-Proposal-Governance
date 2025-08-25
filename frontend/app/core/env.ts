/* eslint-disable node/prefer-global/process */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {}, // no server-only variables for now

  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.url(),
    NEXT_PUBLIC_SMART_CONTRACT_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_ADDRESS_EXPLORER: z.url(),
    NEXT_PUBLIC_TRX_EXPLORER: z.url(),
    NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),
    NEXT_PUBLIC_SEPOLIA_RPC: z.url(),
  },

  // Recommended for Next.js 13.4.4+
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SMART_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS,
    NEXT_PUBLIC_ADDRESS_EXPLORER: process.env.NEXT_PUBLIC_ADDRESS_EXPLORER,
    NEXT_PUBLIC_TRX_EXPLORER: process.env.NEXT_PUBLIC_TRX_EXPLORER,
    NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    NEXT_PUBLIC_SEPOLIA_RPC: process.env.NEXT_PUBLIC_SEPOLIA_RPC,
  },
});

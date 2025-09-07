import { z } from 'zod';
import { createEnv } from './lib/createEnv';

export const env = createEnv({
  server: {}, // no server-only variables for now

  clientPrefix: 'VITE_', // for Vite, use VITE_ as the prefix

  client: {
    VITE_APP_NAME: z.string().min(1),
    VITE_BASE_URL: z.url(),
    VITE_SMART_CONTRACT_ADDRESS: z.string().min(1),
    VITE_ADDRESS_EXPLORER: z.url(),
    VITE_TRX_EXPLORER: z.url(),
    VITE_WALLET_CONNECT_ID: z.string().min(1),
    VITE_SEPOLIA_RPC: z.url(),
  },

  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});

import { createConfig, http, injected } from "wagmi";
import { polygonAmoy, sepolia } from "viem/chains";

export const config = createConfig({
  chains: [sepolia, polygonAmoy],
  connectors: [injected()],
  ssr: true,
  transports: {
    [sepolia.id]: http(`${import.meta.env.VITE_SEPOLIA_RPC}`),
    [polygonAmoy.id]: http(`${import.meta.env.VITE_AMOY_RPC}`),
  },
});

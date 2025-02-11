// import AuthStateSyncer from "@components/AuthStateSyncer";
import Header from "@components/Header";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import "@rainbow-me/rainbowkit/styles.css";
import { sepolia } from "wagmi/chains";
import { http, WagmiProvider } from "wagmi";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: "Fincube",
  projectId: `${import.meta.env.VITE_WALLET_CONNECT_ID}`,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/mNVDS9BNNIgmXc5u1oBGNoB9_L2NOo_g"
    ),
  },
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <>
      <div>
        {/* <AuthStateSyncer /> */}
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              <Header />
              <Outlet />
              <Toaster richColors />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    </>
  );
}

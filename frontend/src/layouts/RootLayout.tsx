// import AuthStateSyncer from "@components/AuthStateSyncer";
import Header from "@components/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@rainbow-me/rainbowkit/styles.css";
import { polygonAmoy } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MFSSidebar from "@components/mfs/MFSSidebar";

export const config = getDefaultConfig({
  appName: "Fincube",
  projectId: `${import.meta.env.VITE_WALLET_CONNECT_ID}`,
  chains: [polygonAmoy],
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
              <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <MFSSidebar />
                <Outlet />
              </div>
              <Toaster richColors />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </div>
    </>
  );
}
